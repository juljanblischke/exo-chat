using ExoChat.Domain.Entities;

namespace ExoChat.Application.Common.Interfaces;

public interface IPushSubscriptionRepository : IRepository<PushSubscription>
{
    Task<IReadOnlyList<PushSubscription>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<PushSubscription?> GetByEndpointAsync(string endpoint, CancellationToken cancellationToken = default);
    Task DeleteByEndpointAsync(string endpoint, CancellationToken cancellationToken = default);
}
