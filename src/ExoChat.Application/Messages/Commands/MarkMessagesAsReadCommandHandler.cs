using ExoChat.Application.Common.Interfaces;
using ExoChat.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Application.Messages.Commands;

public class MarkMessagesAsReadCommandHandler(
    IConversationRepository conversationRepository,
    IParticipantRepository participantRepository,
    IMessageRepository messageRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<MarkMessagesAsReadCommand, int>
{
    public async Task<int> Handle(MarkMessagesAsReadCommand request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var conversation = await conversationRepository.GetWithParticipantsAsync(request.ConversationId, cancellationToken)
            ?? throw new NotFoundException("Conversation", request.ConversationId);

        var participant = conversation.Participants.FirstOrDefault(p => p.UserId == currentUser.Id)
            ?? throw new ForbiddenException("You are not a participant in this conversation.");

        // Determine the message to mark as read up to
        Guid? targetMessageId = request.UpToMessageId;
        if (targetMessageId is null)
        {
            // Default to the latest message in the conversation
            var latestMessage = await messageRepository.Query()
                .Where(m => m.ConversationId == request.ConversationId)
                .OrderByDescending(m => m.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            targetMessageId = latestMessage?.Id;
        }

        if (targetMessageId is null)
            return 0;

        // Count unread messages for response
        var unreadCount = 0;
        if (participant.LastReadMessageId is not null)
        {
            var lastReadMessage = await messageRepository.GetByIdAsync(participant.LastReadMessageId.Value, cancellationToken);
            if (lastReadMessage is not null)
            {
                unreadCount = await messageRepository.Query()
                    .Where(m => m.ConversationId == request.ConversationId
                        && m.CreatedAt > lastReadMessage.CreatedAt
                        && m.SenderId != currentUser.Id)
                    .CountAsync(cancellationToken);
            }
        }
        else
        {
            unreadCount = await messageRepository.Query()
                .Where(m => m.ConversationId == request.ConversationId
                    && m.SenderId != currentUser.Id)
                .CountAsync(cancellationToken);
        }

        // Update the participant's last read message
        participant.LastReadMessageId = targetMessageId;
        participantRepository.Update(participant);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return unreadCount;
    }
}
