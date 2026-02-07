using ExoChat.Domain.Entities;

namespace ExoChat.Application.Common.Interfaces;

public interface IConversationRepository : IRepository<Conversation>
{
    Task<Conversation?> GetWithParticipantsAsync(Guid id, CancellationToken cancellationToken = default);
}
