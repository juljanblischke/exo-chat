using ExoChat.Application.Common.Interfaces;
using ExoChat.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Application.Messages.Queries;

public class GetUnreadCountQueryHandler(
    IConversationRepository conversationRepository,
    IMessageRepository messageRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService) : IRequestHandler<GetUnreadCountQuery, int>
{
    public async Task<int> Handle(GetUnreadCountQuery request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var conversation = await conversationRepository.GetWithParticipantsAsync(request.ConversationId, cancellationToken)
            ?? throw new NotFoundException("Conversation", request.ConversationId);

        var participant = conversation.Participants.FirstOrDefault(p => p.UserId == currentUser.Id)
            ?? throw new ForbiddenException("You are not a participant in this conversation.");

        if (participant.LastReadMessageId is null)
        {
            return await messageRepository.Query()
                .Where(m => m.ConversationId == request.ConversationId && m.SenderId != currentUser.Id)
                .CountAsync(cancellationToken);
        }

        var lastReadMessage = await messageRepository.GetByIdAsync(participant.LastReadMessageId.Value, cancellationToken);
        if (lastReadMessage is null)
            return 0;

        return await messageRepository.Query()
            .Where(m => m.ConversationId == request.ConversationId
                && m.CreatedAt > lastReadMessage.CreatedAt
                && m.SenderId != currentUser.Id)
            .CountAsync(cancellationToken);
    }
}
