using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Users.DTOs;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Users.Queries;

public class GetBlockedUsersQueryHandler(
    IBlockedUserRepository blockedUserRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService) : IRequestHandler<GetBlockedUsersQuery, IReadOnlyList<BlockedUserDto>>
{
    public async Task<IReadOnlyList<BlockedUserDto>> Handle(GetBlockedUsersQuery request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var blockedUsers = await blockedUserRepository.GetBlockedByUserAsync(currentUser.Id, cancellationToken);

        return blockedUsers.Select(b => new BlockedUserDto(
            b.Id,
            b.BlockedUserId,
            b.BlockedUserNavigation.DisplayName,
            b.BlockedUserNavigation.AvatarUrl,
            b.CreatedAt)).ToList();
    }
}
