using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Conversations.DTOs;
using ExoChat.Domain.Entities;
using ExoChat.Domain.Enums;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Conversations.Commands;

public class CreateGroupConversationCommandHandler(
    IConversationRepository conversationRepository,
    IUserRepository userRepository,
    IParticipantRepository participantRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<CreateGroupConversationCommand, ConversationDto>
{
    public async Task<ConversationDto> Handle(CreateGroupConversationCommand request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        // Validate all member user IDs exist
        var memberIds = request.MemberUserIds.Distinct().Where(id => id != currentUser.Id).ToList();
        foreach (var memberId in memberIds)
        {
            if (!await userRepository.ExistsAsync(memberId, cancellationToken))
                throw new NotFoundException("User", memberId);
        }

        var conversation = new Conversation
        {
            Type = ConversationType.Group,
            UpdatedAt = DateTime.UtcNow,
            Group = new Group
            {
                Name = request.Name,
                Description = request.Description
            }
        };

        conversation.Group.ConversationId = conversation.Id;

        await conversationRepository.AddAsync(conversation, cancellationToken);

        // Add the creator as Owner
        await participantRepository.AddAsync(new Participant
        {
            ConversationId = conversation.Id,
            UserId = currentUser.Id,
            Role = ParticipantRole.Owner
        }, cancellationToken);

        // Add members
        foreach (var memberId in memberIds)
        {
            await participantRepository.AddAsync(new Participant
            {
                ConversationId = conversation.Id,
                UserId = memberId,
                Role = ParticipantRole.Member
            }, cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var created = await conversationRepository.GetWithParticipantsAsync(conversation.Id, cancellationToken)
            ?? throw new NotFoundException("Conversation", conversation.Id);

        return new ConversationDto(
            created.Id,
            created.Type,
            created.CreatedAt,
            created.UpdatedAt,
            created.Group is not null ? new GroupInfoDto(created.Group.Name, created.Group.Description, created.Group.AvatarUrl) : null,
            created.Participants.Select(p => new ParticipantDto(
                p.UserId,
                p.User.DisplayName,
                p.User.AvatarUrl,
                p.Role,
                p.JoinedAt,
                p.LastReadMessageId)).ToList());
    }
}
