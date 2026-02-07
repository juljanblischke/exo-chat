using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Notifications.DTOs;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Notifications.Queries;

public class GetNotificationPreferencesQueryHandler(
    INotificationPreferenceRepository notificationPreferenceRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService) : IRequestHandler<GetNotificationPreferencesQuery, IReadOnlyList<NotificationPreferenceDto>>
{
    public async Task<IReadOnlyList<NotificationPreferenceDto>> Handle(GetNotificationPreferencesQuery request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var preferences = await notificationPreferenceRepository.GetAllByUserIdAsync(currentUser.Id, cancellationToken);

        return preferences.Select(p => new NotificationPreferenceDto(
            p.Id,
            p.ConversationId,
            p.Conversation?.Group?.Name,
            p.EnablePush,
            p.EnableSound,
            p.EnableDesktop,
            p.MutedUntil)).ToList();
    }
}
