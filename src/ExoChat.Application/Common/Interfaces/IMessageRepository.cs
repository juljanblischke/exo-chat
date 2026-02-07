using ExoChat.Domain.Entities;

namespace ExoChat.Application.Common.Interfaces;

public interface IMessageRepository : IRepository<Message>
{
    Task<IReadOnlyList<Message>> GetConversationMessagesAsync(Guid conversationId, int page, int pageSize, CancellationToken cancellationToken = default);
}
