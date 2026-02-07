using ExoChat.Application.Common.Interfaces;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Encryption.Queries;

public class GetIdentityKeyQueryHandler(
    IEncryptionKeyRepository encryptionKeyRepository) : IRequestHandler<GetIdentityKeyQuery, string>
{
    public async Task<string> Handle(GetIdentityKeyQuery request, CancellationToken cancellationToken)
    {
        var identityKey = await encryptionKeyRepository.GetIdentityKeyAsync(request.UserId, cancellationToken)
            ?? throw new NotFoundException("IdentityKey", request.UserId);

        return Convert.ToBase64String(identityKey.PublicKey);
    }
}
