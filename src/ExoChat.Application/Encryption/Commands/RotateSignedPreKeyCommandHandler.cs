using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities.Encryption;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Encryption.Commands;

public class RotateSignedPreKeyCommandHandler(
    IEncryptionKeyRepository encryptionKeyRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<RotateSignedPreKeyCommand, Unit>
{
    public async Task<Unit> Handle(RotateSignedPreKeyCommand request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var spk = request.SignedPreKey;
        var signedPreKey = new SignedPreKey
        {
            UserId = currentUser.Id,
            KeyId = spk.KeyId,
            PublicKey = Convert.FromBase64String(spk.PublicKey),
            PrivateKeyEncrypted = Convert.FromBase64String(spk.PrivateKeyEncrypted),
            Signature = Convert.FromBase64String(spk.Signature),
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };

        await encryptionKeyRepository.AddSignedPreKeyAsync(signedPreKey, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
