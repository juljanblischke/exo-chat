using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities;
using ExoChat.Domain.Enums;
using ExoChat.Infrastructure.Options;
using ExoChat.Infrastructure.Persistence;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using WebPush;

namespace ExoChat.Infrastructure.Services;

public class WebPushNotificationService(
    ExoChatDbContext context,
    IOptions<VapidOptions> vapidOptions,
    ILogger<WebPushNotificationService> logger) : INotificationService
{
    private readonly VapidOptions _vapidOptions = vapidOptions.Value;

    public async Task SendPushNotificationAsync(
        Guid userId, string title, string body, string? data = null, CancellationToken cancellationToken = default)
    {
        var subscriptions = await GetSubscriptionsAsync(userId, cancellationToken);
        if (subscriptions.Count == 0) return;

        var client = new WebPushClient();
        var vapidDetails = new VapidDetails(_vapidOptions.Subject, _vapidOptions.PublicKey, _vapidOptions.PrivateKey);

        var payload = System.Text.Json.JsonSerializer.Serialize(new { title, body, data });

        foreach (var sub in subscriptions)
        {
            try
            {
                var pushSubscription = new WebPush.PushSubscription(sub.Endpoint, sub.P256dhKey, sub.AuthKey);
                await client.SendNotificationAsync(pushSubscription, payload, vapidDetails);
            }
            catch (WebPushException ex) when (ex.StatusCode == System.Net.HttpStatusCode.Gone)
            {
                // Subscription is no longer valid, remove it
                context.PushSubscriptions.Remove(sub);
                logger.LogInformation("Removed expired push subscription {Endpoint} for user {UserId}", sub.Endpoint, userId);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to send push notification to {Endpoint} for user {UserId}", sub.Endpoint, userId);
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task SendNotificationAsync(
        Guid userId, NotificationType type, string title, string body, Guid? conversationId = null, string? data = null, CancellationToken cancellationToken = default)
    {
        // Create persistent notification
        var notification = new Notification
        {
            UserId = userId,
            Type = type,
            Title = title,
            Body = body,
            Data = data,
            ConversationId = conversationId,
            IsRead = false
        };

        context.Notifications.Add(notification);
        await context.SaveChangesAsync(cancellationToken);

        // Send push notification
        await SendPushNotificationAsync(userId, title, body, data, cancellationToken);
    }

    private async Task<List<Domain.Entities.PushSubscription>> GetSubscriptionsAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions
            .ToListAsync(
                context.PushSubscriptions.Where(p => p.UserId == userId),
                cancellationToken);
    }
}
