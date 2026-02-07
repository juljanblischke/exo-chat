using ExoChat.Domain.Enums;

namespace ExoChat.Application.Notifications.DTOs;

public record NotificationDto(
    Guid Id,
    NotificationType Type,
    string Title,
    string Body,
    string? Data,
    bool IsRead,
    Guid? ConversationId,
    DateTime CreatedAt);
