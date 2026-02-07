using MediatR;

namespace ExoChat.Application.Notifications.Commands;

public record MarkNotificationReadCommand(Guid NotificationId) : IRequest;
