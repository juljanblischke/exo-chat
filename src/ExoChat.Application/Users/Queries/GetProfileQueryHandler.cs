using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Users.DTOs;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Users.Queries;

public class GetProfileQueryHandler(
    IUserRepository userRepository,
    ICurrentUserService currentUserService) : IRequestHandler<GetProfileQuery, UserProfileDto>
{
    public async Task<UserProfileDto> Handle(GetProfileQuery request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        return new UserProfileDto(
            currentUser.Id,
            currentUser.DisplayName,
            currentUser.AvatarUrl,
            currentUser.StatusMessage,
            currentUserService.Email);
    }
}
