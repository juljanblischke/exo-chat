using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Encryption.DTOs;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Encryption.Queries;

public class GetPreKeyBundleQueryHandler(
    IEncryptionKeyRepository encryptionKeyRepository) : IRequestHandler<GetPreKeyBundleQuery, PreKeyBundleDto>
{
    public async Task<PreKeyBundleDto> Handle(GetPreKeyBundleQuery request, CancellationToken cancellationToken)
    {
        var identityKey = await encryptionKeyRepository.GetIdentityKeyAsync(request.UserId, cancellationToken)
            ?? throw new NotFoundException("IdentityKey", request.UserId);

        var signedPreKey = await encryptionKeyRepository.GetActiveSignedPreKeyAsync(request.UserId, cancellationToken)
            ?? throw new NotFoundException("SignedPreKey", request.UserId);

        var oneTimePreKey = await encryptionKeyRepository.GetAvailableOneTimePreKeyAsync(request.UserId, cancellationToken);

        if (oneTimePreKey is not null)
        {
            await encryptionKeyRepository.MarkOneTimePreKeyAsUsedAsync(oneTimePreKey.Id, cancellationToken);
        }

        return new PreKeyBundleDto(
            request.UserId,
            Convert.ToBase64String(identityKey.PublicKey),
            signedPreKey.KeyId,
            Convert.ToBase64String(signedPreKey.PublicKey),
            Convert.ToBase64String(signedPreKey.Signature),
            oneTimePreKey?.KeyId,
            oneTimePreKey is not null ? Convert.ToBase64String(oneTimePreKey.PublicKey) : null);
    }
}
