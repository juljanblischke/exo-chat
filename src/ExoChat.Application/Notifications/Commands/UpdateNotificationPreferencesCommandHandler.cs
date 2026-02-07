using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Notifications.DTOs;
using ExoChat.Domain.Entities;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Notifications.Commands;

public class UpdateNotificationPreferencesCommandHandler(
    INotificationPreferenceRepository notificationPreferenceRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<UpdateNotificationPreferencesCommand, NotificationPreferenceDto>
{
    public async Task<NotificationPreferenceDto> Handle(UpdateNotificationPreferencesCommand request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        NotificationPreference? preference;

        if (request.ConversationId.HasValue)
            preference = await notificationPreferenceRepository.GetConversationPreferenceAsync(currentUser.Id, request.ConversationId.Value, cancellationToken);
        else
            preference = await notificationPreferenceRepository.GetGlobalPreferenceAsync(currentUser.Id, cancellationToken);

        if (preference is null)
        {
            preference = new NotificationPreference
            {
                UserId = currentUser.Id,
                ConversationId = request.ConversationId,
                EnablePush = request.EnablePush,
                EnableSound = request.EnableSound,
                EnableDesktop = request.EnableDesktop,
                MutedUntil = request.MutedUntil
            };
            await notificationPreferenceRepository.AddAsync(preference, cancellationToken);
        }
        else
        {
            preference.EnablePush = request.EnablePush;
            preference.EnableSound = request.EnableSound;
            preference.EnableDesktop = request.EnableDesktop;
            preference.MutedUntil = request.MutedUntil;
            notificationPreferenceRepository.Update(preference);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new NotificationPreferenceDto(
            preference.Id,
            preference.ConversationId,
            null,
            preference.EnablePush,
            preference.EnableSound,
            preference.EnableDesktop,
            preference.MutedUntil);
    }
}
