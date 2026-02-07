using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Conversations.DTOs;
using ExoChat.Application.Groups.DTOs;
using ExoChat.Domain.Enums;
using ExoChat.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Application.Groups.Commands;

public class UpdateGroupCommandHandler(
    IConversationRepository conversationRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<UpdateGroupCommand, GroupDto>
{
    public async Task<GroupDto> Handle(UpdateGroupCommand request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var conversation = await conversationRepository.GetWithParticipantsAsync(request.ConversationId, cancellationToken)
            ?? throw new NotFoundException("Conversation", request.ConversationId);

        if (conversation.Type != ConversationType.Group)
            throw new ConflictException("This conversation is not a group.");

        var participant = conversation.Participants.FirstOrDefault(p => p.UserId == currentUser.Id)
            ?? throw new ForbiddenException("You are not a participant in this conversation.");

        if (participant.Role < ParticipantRole.Admin)
            throw new ForbiddenException("Only admins and owners can update group settings.");

        if (conversation.Group is null)
            throw new NotFoundException("Group", request.ConversationId);

        conversation.Group.Name = request.Name;
        conversation.Group.Description = request.Description;
        conversation.Group.AvatarUrl = request.AvatarUrl;

        conversationRepository.Update(conversation);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new GroupDto(
            conversation.Id,
            conversation.Group.Name,
            conversation.Group.Description,
            conversation.Group.AvatarUrl,
            conversation.Participants.Select(p => new ParticipantDto(
                p.UserId, p.User.DisplayName, p.User.AvatarUrl, p.Role, p.JoinedAt, p.LastReadMessageId)).ToList());
    }
}
