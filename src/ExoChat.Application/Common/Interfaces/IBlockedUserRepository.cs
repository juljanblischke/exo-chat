using ExoChat.Domain.Entities;

namespace ExoChat.Application.Common.Interfaces;

public interface IBlockedUserRepository : IRepository<BlockedUser>
{
    Task<IReadOnlyList<BlockedUser>> GetBlockedByUserAsync(Guid blockerUserId, CancellationToken cancellationToken = default);
    Task<bool> IsBlockedAsync(Guid blockerUserId, Guid blockedUserId, CancellationToken cancellationToken = default);
    Task<BlockedUser?> GetBlockEntryAsync(Guid blockerUserId, Guid blockedUserId, CancellationToken cancellationToken = default);
}
