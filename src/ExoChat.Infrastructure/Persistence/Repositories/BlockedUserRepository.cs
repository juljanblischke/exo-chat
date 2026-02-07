using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Infrastructure.Persistence.Repositories;

public class BlockedUserRepository(ExoChatDbContext context) : Repository<BlockedUser>(context), IBlockedUserRepository
{
    public async Task<IReadOnlyList<BlockedUser>> GetBlockedByUserAsync(
        Guid blockerUserId, CancellationToken cancellationToken = default)
        => await DbSet
            .Where(b => b.BlockerUserId == blockerUserId)
            .Include(b => b.BlockedUserNavigation)
            .ToListAsync(cancellationToken);

    public async Task<bool> IsBlockedAsync(
        Guid blockerUserId, Guid blockedUserId, CancellationToken cancellationToken = default)
        => await DbSet.AnyAsync(b => b.BlockerUserId == blockerUserId && b.BlockedUserId == blockedUserId, cancellationToken);

    public async Task<BlockedUser?> GetBlockEntryAsync(
        Guid blockerUserId, Guid blockedUserId, CancellationToken cancellationToken = default)
        => await DbSet.FirstOrDefaultAsync(b => b.BlockerUserId == blockerUserId && b.BlockedUserId == blockedUserId, cancellationToken);
}
