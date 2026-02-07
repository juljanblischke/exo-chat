using ExoChat.Application.Notifications.DTOs;
using MediatR;

namespace ExoChat.Application.Notifications.Queries;

public record GetNotificationPreferencesQuery : IRequest<IReadOnlyList<NotificationPreferenceDto>>;
