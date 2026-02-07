using ExoChat.Domain.Entities;

namespace ExoChat.Application.Common.Interfaces;

public interface IParticipantRepository : IRepository<Participant>
{
    Task<IReadOnlyList<Participant>> GetByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default);
}
