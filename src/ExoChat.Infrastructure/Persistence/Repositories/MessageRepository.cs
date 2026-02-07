using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Common.Models;
using ExoChat.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Infrastructure.Persistence.Repositories;

public class MessageRepository(ExoChatDbContext context) : Repository<Message>(context), IMessageRepository
{
    public async Task<IReadOnlyList<Message>> GetConversationMessagesAsync(
        Guid conversationId, int page, int pageSize, CancellationToken cancellationToken = default)
        => await DbSet
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(m => m.Sender)
            .Include(m => m.Attachments)
            .ToListAsync(cancellationToken);

    public async Task<PagedResult<MessageSearchResult>> SearchMessagesAsync(
        string searchTerm, List<Guid> conversationIds, Guid? conversationId,
        DateTime? dateFrom, DateTime? dateTo, int pageNumber, int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet
            .Include(m => m.Sender)
            .Include(m => m.Conversation)
            .Where(m => conversationIds.Contains(m.ConversationId))
            .Where(m => m.Content != null && EF.Functions.ILike(m.Content, $"%{searchTerm}%"));

        if (conversationId.HasValue)
            query = query.Where(m => m.ConversationId == conversationId.Value);

        if (dateFrom.HasValue)
            query = query.Where(m => m.CreatedAt >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(m => m.CreatedAt <= dateTo.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var messages = await query
            .OrderByDescending(m => m.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var results = messages.Select(m => new MessageSearchResult
        {
            MessageId = m.Id,
            ContentSnippet = m.Content?.Length > 200 ? m.Content[..200] + "..." : m.Content ?? string.Empty,
            ConversationId = m.ConversationId,
            ConversationName = m.Conversation?.Group?.Name,
            SenderName = m.Sender?.DisplayName ?? "Unknown",
            SenderAvatarUrl = m.Sender?.AvatarUrl,
            SentAt = m.CreatedAt
        }).ToList();

        return new PagedResult<MessageSearchResult>(results, totalCount, pageNumber, pageSize);
    }
}
