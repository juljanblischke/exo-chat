using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Users.DTOs;
using ExoChat.Domain.Entities;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Users.Commands;

public class UpdatePrivacySettingsCommandHandler(
    IUserPrivacySettingsRepository privacySettingsRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<UpdatePrivacySettingsCommand, UserPrivacySettingsDto>
{
    public async Task<UserPrivacySettingsDto> Handle(UpdatePrivacySettingsCommand request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var settings = await privacySettingsRepository.GetByUserIdAsync(currentUser.Id, cancellationToken);

        if (settings is null)
        {
            settings = new UserPrivacySettings
            {
                UserId = currentUser.Id,
                ReadReceiptsEnabled = request.ReadReceiptsEnabled,
                OnlineStatusVisibility = request.OnlineStatusVisibility
            };
            await privacySettingsRepository.AddAsync(settings, cancellationToken);
        }
        else
        {
            settings.ReadReceiptsEnabled = request.ReadReceiptsEnabled;
            settings.OnlineStatusVisibility = request.OnlineStatusVisibility;
            privacySettingsRepository.Update(settings);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new UserPrivacySettingsDto(
            settings.ReadReceiptsEnabled,
            settings.OnlineStatusVisibility);
    }
}
