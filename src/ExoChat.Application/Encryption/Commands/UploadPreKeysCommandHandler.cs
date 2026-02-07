using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities.Encryption;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Encryption.Commands;

public class UploadPreKeysCommandHandler(
    IEncryptionKeyRepository encryptionKeyRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<UploadPreKeysCommand, Unit>
{
    public async Task<Unit> Handle(UploadPreKeysCommand request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var keys = request.Keys;

        // Store identity key
        var existingIdentityKey = await encryptionKeyRepository.GetIdentityKeyAsync(currentUser.Id, cancellationToken);
        if (existingIdentityKey is null)
        {
            var identityKey = new IdentityKey
            {
                UserId = currentUser.Id,
                PublicKey = Convert.FromBase64String(keys.IdentityPublicKey),
                PrivateKeyEncrypted = Convert.FromBase64String(keys.IdentityPrivateKeyEncrypted)
            };
            await encryptionKeyRepository.AddIdentityKeyAsync(identityKey, cancellationToken);
        }

        // Store signed pre-key
        var signedPreKey = new SignedPreKey
        {
            UserId = currentUser.Id,
            KeyId = keys.SignedPreKey.KeyId,
            PublicKey = Convert.FromBase64String(keys.SignedPreKey.PublicKey),
            PrivateKeyEncrypted = Convert.FromBase64String(keys.SignedPreKey.PrivateKeyEncrypted),
            Signature = Convert.FromBase64String(keys.SignedPreKey.Signature),
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };
        await encryptionKeyRepository.AddSignedPreKeyAsync(signedPreKey, cancellationToken);

        // Store one-time pre-keys
        var oneTimePreKeys = keys.OneTimePreKeys.Select(otpk => new OneTimePreKey
        {
            UserId = currentUser.Id,
            KeyId = otpk.KeyId,
            PublicKey = Convert.FromBase64String(otpk.PublicKey),
            PrivateKeyEncrypted = Convert.FromBase64String(otpk.PrivateKeyEncrypted),
            IsUsed = false
        }).ToList();

        await encryptionKeyRepository.AddOneTimePreKeysAsync(oneTimePreKeys, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
