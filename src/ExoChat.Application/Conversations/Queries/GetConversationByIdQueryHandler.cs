using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Conversations.DTOs;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Conversations.Queries;

public class GetConversationByIdQueryHandler(
    IConversationRepository conversationRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService) : IRequestHandler<GetConversationByIdQuery, ConversationDto>
{
    public async Task<ConversationDto> Handle(GetConversationByIdQuery request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var conversation = await conversationRepository.GetWithParticipantsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Conversation", request.Id);

        // Verify user is a participant
        if (!conversation.Participants.Any(p => p.UserId == currentUser.Id))
            throw new ForbiddenException("You are not a participant in this conversation.");

        return new ConversationDto(
            conversation.Id,
            conversation.Type,
            conversation.CreatedAt,
            conversation.UpdatedAt,
            conversation.Group is not null
                ? new GroupInfoDto(conversation.Group.Name, conversation.Group.Description, conversation.Group.AvatarUrl)
                : null,
            conversation.Participants.Select(p => new ParticipantDto(
                p.UserId,
                p.User.DisplayName,
                p.User.AvatarUrl,
                p.Role,
                p.JoinedAt,
                p.LastReadMessageId)).ToList());
    }
}
