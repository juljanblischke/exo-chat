using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Encryption.DTOs;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Encryption.Queries;

public class GetOneTimePreKeyCountQueryHandler(
    IEncryptionKeyRepository encryptionKeyRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService) : IRequestHandler<GetOneTimePreKeyCountQuery, KeyCountDto>
{
    public async Task<KeyCountDto> Handle(GetOneTimePreKeyCountQuery request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var count = await encryptionKeyRepository.GetAvailableOneTimePreKeyCountAsync(currentUser.Id, cancellationToken);

        return new KeyCountDto(count);
    }
}
