using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Common.Models;
using ExoChat.Application.Messages.DTOs;
using ExoChat.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Application.Messages.Queries;

public class GetMessagesQueryHandler(
    IConversationRepository conversationRepository,
    IMessageRepository messageRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService) : IRequestHandler<GetMessagesQuery, CursorPagedResult<MessageDto>>
{
    public async Task<CursorPagedResult<MessageDto>> Handle(GetMessagesQuery request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var conversation = await conversationRepository.GetWithParticipantsAsync(request.ConversationId, cancellationToken)
            ?? throw new NotFoundException("Conversation", request.ConversationId);

        if (!conversation.Participants.Any(p => p.UserId == currentUser.Id))
            throw new ForbiddenException("You are not a participant in this conversation.");

        var limit = Math.Clamp(request.Limit, 1, 100);

        var query = messageRepository.Query()
            .IgnoreQueryFilters()
            .Where(m => m.ConversationId == request.ConversationId);

        // Cursor-based pagination: cursor is the message ID
        // We fetch messages older than the cursor (scrolling up through history)
        if (!string.IsNullOrEmpty(request.Cursor) && Guid.TryParse(request.Cursor, out var cursorId))
        {
            var cursorMessage = await messageRepository.GetByIdAsync(cursorId, cancellationToken);
            if (cursorMessage is not null)
            {
                query = query.Where(m => m.CreatedAt < cursorMessage.CreatedAt
                    || (m.CreatedAt == cursorMessage.CreatedAt && m.Id.CompareTo(cursorId) < 0));
            }
        }

        var messages = await query
            .OrderByDescending(m => m.CreatedAt)
            .ThenByDescending(m => m.Id)
            .Take(limit + 1)
            .Include(m => m.Sender)
            .Include(m => m.Attachments)
            .ToListAsync(cancellationToken);

        var hasMore = messages.Count > limit;
        if (hasMore)
            messages = messages.Take(limit).ToList();

        var items = messages.Select(m => new MessageDto(
            m.Id,
            m.ConversationId,
            m.SenderId,
            m.Sender.DisplayName,
            m.Sender.AvatarUrl,
            m.Content,
            m.MessageType,
            m.IsEncrypted,
            m.CreatedAt,
            m.EditedAt,
            m.DeletedAt,
            m.Attachments.Select(a => new FileAttachmentDto(
                a.Id, a.FileName, a.ContentType, a.Size, a.StorageKey, a.ThumbnailKey)).ToList())).ToList();

        var nextCursor = hasMore && items.Count > 0 ? items.Last().Id.ToString() : null;

        return new CursorPagedResult<MessageDto>(items, nextCursor, request.Cursor, hasMore);
    }
}
