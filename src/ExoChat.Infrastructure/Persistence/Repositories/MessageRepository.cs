using ExoChat.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Infrastructure.Persistence.Repositories;

public interface IMessageRepository : Application.Common.Interfaces.IRepository<Message>
{
    Task<IReadOnlyList<Message>> GetConversationMessagesAsync(Guid conversationId, int page, int pageSize, CancellationToken cancellationToken = default);
}

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
}
