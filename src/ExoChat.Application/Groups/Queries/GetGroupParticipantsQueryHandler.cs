using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Conversations.DTOs;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Groups.Queries;

public class GetGroupParticipantsQueryHandler(
    IConversationRepository conversationRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService) : IRequestHandler<GetGroupParticipantsQuery, IReadOnlyList<ParticipantDto>>
{
    public async Task<IReadOnlyList<ParticipantDto>> Handle(GetGroupParticipantsQuery request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var conversation = await conversationRepository.GetWithParticipantsAsync(request.ConversationId, cancellationToken)
            ?? throw new NotFoundException("Conversation", request.ConversationId);

        if (!conversation.Participants.Any(p => p.UserId == currentUser.Id))
            throw new ForbiddenException("You are not a participant in this conversation.");

        return conversation.Participants.Select(p => new ParticipantDto(
            p.UserId,
            p.User.DisplayName,
            p.User.AvatarUrl,
            p.Role,
            p.JoinedAt,
            p.LastReadMessageId)).ToList();
    }
}
