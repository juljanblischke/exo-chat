using ExoChat.Domain.Enums;

namespace ExoChat.Application.Common.Interfaces;

public interface INotificationService
{
    Task SendPushNotificationAsync(Guid userId, string title, string body, string? data = null, CancellationToken cancellationToken = default);
    Task SendNotificationAsync(Guid userId, NotificationType type, string title, string body, Guid? conversationId = null, string? data = null, CancellationToken cancellationToken = default);
}
