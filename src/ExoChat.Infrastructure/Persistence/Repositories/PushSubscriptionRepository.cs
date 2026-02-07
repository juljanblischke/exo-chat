using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Infrastructure.Persistence.Repositories;

public class PushSubscriptionRepository(ExoChatDbContext context) : Repository<PushSubscription>(context), IPushSubscriptionRepository
{
    public async Task<IReadOnlyList<PushSubscription>> GetByUserIdAsync(
        Guid userId, CancellationToken cancellationToken = default)
        => await DbSet.Where(p => p.UserId == userId).ToListAsync(cancellationToken);

    public async Task<PushSubscription?> GetByEndpointAsync(
        string endpoint, CancellationToken cancellationToken = default)
        => await DbSet.FirstOrDefaultAsync(p => p.Endpoint == endpoint, cancellationToken);

    public async Task DeleteByEndpointAsync(string endpoint, CancellationToken cancellationToken = default)
        => await DbSet.Where(p => p.Endpoint == endpoint).ExecuteDeleteAsync(cancellationToken);
}
