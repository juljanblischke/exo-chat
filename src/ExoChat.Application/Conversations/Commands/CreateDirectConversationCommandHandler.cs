using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Conversations.DTOs;
using ExoChat.Domain.Entities;
using ExoChat.Domain.Enums;
using ExoChat.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Application.Conversations.Commands;

public class CreateDirectConversationCommandHandler(
    IConversationRepository conversationRepository,
    IUserRepository userRepository,
    IParticipantRepository participantRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<CreateDirectConversationCommand, ConversationDto>
{
    public async Task<ConversationDto> Handle(CreateDirectConversationCommand request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var otherUser = await userRepository.GetByIdAsync(request.OtherUserId, cancellationToken)
            ?? throw new NotFoundException("User", request.OtherUserId);

        if (currentUser.Id == otherUser.Id)
            throw new ConflictException("Cannot create a conversation with yourself.");

        // Check if direct conversation already exists between these two users
        var existing = await conversationRepository.Query()
            .Where(c => c.Type == ConversationType.Direct)
            .Where(c => c.Participants.Any(p => p.UserId == currentUser.Id))
            .Where(c => c.Participants.Any(p => p.UserId == otherUser.Id))
            .Include(c => c.Participants).ThenInclude(p => p.User)
            .Include(c => c.Group)
            .FirstOrDefaultAsync(cancellationToken);

        if (existing is not null)
        {
            return MapToDto(existing);
        }

        var conversation = new Conversation
        {
            Type = ConversationType.Direct,
            UpdatedAt = DateTime.UtcNow
        };

        await conversationRepository.AddAsync(conversation, cancellationToken);

        var participant1 = new Participant
        {
            ConversationId = conversation.Id,
            UserId = currentUser.Id,
            Role = ParticipantRole.Member
        };

        var participant2 = new Participant
        {
            ConversationId = conversation.Id,
            UserId = otherUser.Id,
            Role = ParticipantRole.Member
        };

        await participantRepository.AddAsync(participant1, cancellationToken);
        await participantRepository.AddAsync(participant2, cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        // Reload with includes
        var created = await conversationRepository.GetWithParticipantsAsync(conversation.Id, cancellationToken)
            ?? throw new NotFoundException("Conversation", conversation.Id);

        return MapToDto(created);
    }

    private static ConversationDto MapToDto(Conversation c) => new(
        c.Id,
        c.Type,
        c.CreatedAt,
        c.UpdatedAt,
        c.Group is not null ? new GroupInfoDto(c.Group.Name, c.Group.Description, c.Group.AvatarUrl) : null,
        c.Participants.Select(p => new ParticipantDto(
            p.UserId,
            p.User.DisplayName,
            p.User.AvatarUrl,
            p.Role,
            p.JoinedAt,
            p.LastReadMessageId)).ToList());
}
