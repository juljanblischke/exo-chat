using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities.Encryption;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Infrastructure.Persistence.Repositories;

public class EncryptionKeyRepository(ExoChatDbContext context) : IEncryptionKeyRepository
{
    public async Task<IdentityKey?> GetIdentityKeyAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await context.IdentityKeys
            .FirstOrDefaultAsync(k => k.UserId == userId, cancellationToken);
    }

    public async Task<SignedPreKey?> GetActiveSignedPreKeyAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await context.SignedPreKeys
            .Where(k => k.UserId == userId && k.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(k => k.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<OneTimePreKey?> GetAvailableOneTimePreKeyAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await context.OneTimePreKeys
            .Where(k => k.UserId == userId && !k.IsUsed)
            .OrderBy(k => k.KeyId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<int> GetAvailableOneTimePreKeyCountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await context.OneTimePreKeys
            .CountAsync(k => k.UserId == userId && !k.IsUsed, cancellationToken);
    }

    public async Task AddIdentityKeyAsync(IdentityKey key, CancellationToken cancellationToken = default)
    {
        await context.IdentityKeys.AddAsync(key, cancellationToken);
    }

    public async Task AddSignedPreKeyAsync(SignedPreKey key, CancellationToken cancellationToken = default)
    {
        await context.SignedPreKeys.AddAsync(key, cancellationToken);
    }

    public async Task AddOneTimePreKeysAsync(IEnumerable<OneTimePreKey> keys, CancellationToken cancellationToken = default)
    {
        await context.OneTimePreKeys.AddRangeAsync(keys, cancellationToken);
    }

    public async Task MarkOneTimePreKeyAsUsedAsync(Guid keyId, CancellationToken cancellationToken = default)
    {
        var key = await context.OneTimePreKeys.FindAsync(new object[] { keyId }, cancellationToken);
        if (key is not null)
        {
            key.IsUsed = true;
        }
    }
}
