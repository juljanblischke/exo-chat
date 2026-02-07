namespace ExoChat.Application.Notifications.DTOs;

public record NotificationPreferenceDto(
    Guid Id,
    Guid? ConversationId,
    string? ConversationName,
    bool EnablePush,
    bool EnableSound,
    bool EnableDesktop,
    DateTime? MutedUntil);
