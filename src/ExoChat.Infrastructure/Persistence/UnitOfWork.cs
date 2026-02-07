using ExoChat.Application.Common.Interfaces;

namespace ExoChat.Infrastructure.Persistence;

public class UnitOfWork(ExoChatDbContext context) : IUnitOfWork
{
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken);

    public void Dispose() => context.Dispose();
}
