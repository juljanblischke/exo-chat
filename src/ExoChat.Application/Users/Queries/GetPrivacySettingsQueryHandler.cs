using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Users.DTOs;
using ExoChat.Domain.Enums;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Users.Queries;

public class GetPrivacySettingsQueryHandler(
    IUserPrivacySettingsRepository privacySettingsRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService) : IRequestHandler<GetPrivacySettingsQuery, UserPrivacySettingsDto>
{
    public async Task<UserPrivacySettingsDto> Handle(GetPrivacySettingsQuery request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var settings = await privacySettingsRepository.GetByUserIdAsync(currentUser.Id, cancellationToken);

        return new UserPrivacySettingsDto(
            settings?.ReadReceiptsEnabled ?? true,
            settings?.OnlineStatusVisibility ?? StatusVisibility.Everyone);
    }
}
