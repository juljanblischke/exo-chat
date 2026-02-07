using ExoChat.Application.Common.Models;
using ExoChat.Domain.Entities;

namespace ExoChat.Application.Common.Interfaces;

public interface IMessageRepository : IRepository<Message>
{
    Task<IReadOnlyList<Message>> GetConversationMessagesAsync(Guid conversationId, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<PagedResult<MessageSearchResult>> SearchMessagesAsync(string searchTerm, List<Guid> conversationIds, Guid? conversationId, DateTime? dateFrom, DateTime? dateTo, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
}
