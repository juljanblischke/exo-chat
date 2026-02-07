using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Conversations.DTOs;
using ExoChat.Domain.Entities;
using ExoChat.Domain.Enums;
using ExoChat.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Application.Groups.Commands;

public class AddParticipantCommandHandler(
    IConversationRepository conversationRepository,
    IParticipantRepository participantRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<AddParticipantCommand, ParticipantDto>
{
    public async Task<ParticipantDto> Handle(AddParticipantCommand request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var conversation = await conversationRepository.GetWithParticipantsAsync(request.ConversationId, cancellationToken)
            ?? throw new NotFoundException("Conversation", request.ConversationId);

        if (conversation.Type != ConversationType.Group)
            throw new ConflictException("Can only add participants to group conversations.");

        var currentParticipant = conversation.Participants.FirstOrDefault(p => p.UserId == currentUser.Id)
            ?? throw new ForbiddenException("You are not a participant in this conversation.");

        if (currentParticipant.Role < ParticipantRole.Admin)
            throw new ForbiddenException("Only admins and owners can add participants.");

        var userToAdd = await userRepository.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw new NotFoundException("User", request.UserId);

        if (conversation.Participants.Any(p => p.UserId == request.UserId))
            throw new ConflictException("User is already a participant in this conversation.");

        var newParticipant = new Participant
        {
            ConversationId = request.ConversationId,
            UserId = request.UserId,
            Role = ParticipantRole.Member
        };

        await participantRepository.AddAsync(newParticipant, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ParticipantDto(
            userToAdd.Id,
            userToAdd.DisplayName,
            userToAdd.AvatarUrl,
            newParticipant.Role,
            newParticipant.JoinedAt,
            newParticipant.LastReadMessageId);
    }
}
