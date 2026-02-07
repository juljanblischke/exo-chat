using ExoChat.Application.Common.Interfaces;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Conversations.Queries;

public class GetUserStatusQueryHandler(
    IUserRepository userRepository,
    IPresenceService presenceService) : IRequestHandler<GetUserStatusQuery, UserStatusDto>
{
    public async Task<UserStatusDto> Handle(GetUserStatusQuery request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw new NotFoundException("User", request.UserId);

        var isOnline = await presenceService.IsUserOnlineAsync(user.KeycloakId, cancellationToken);

        return new UserStatusDto(isOnline, user.LastSeenAt);
    }
}
