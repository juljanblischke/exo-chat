using ExoChat.Domain.Entities.Encryption;

namespace ExoChat.Application.Common.Interfaces;

public interface IEncryptionKeyRepository
{
    Task<IdentityKey?> GetIdentityKeyAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<SignedPreKey?> GetActiveSignedPreKeyAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<OneTimePreKey?> GetAvailableOneTimePreKeyAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<int> GetAvailableOneTimePreKeyCountAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddIdentityKeyAsync(IdentityKey key, CancellationToken cancellationToken = default);
    Task AddSignedPreKeyAsync(SignedPreKey key, CancellationToken cancellationToken = default);
    Task AddOneTimePreKeysAsync(IEnumerable<OneTimePreKey> keys, CancellationToken cancellationToken = default);
    Task MarkOneTimePreKeyAsUsedAsync(Guid keyId, CancellationToken cancellationToken = default);
}
