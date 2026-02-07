using ExoChat.Application.Notifications.DTOs;
using MediatR;

namespace ExoChat.Application.Notifications.Commands;

public record UpdateNotificationPreferencesCommand(
    Guid? ConversationId,
    bool EnablePush,
    bool EnableSound,
    bool EnableDesktop,
    DateTime? MutedUntil) : IRequest<NotificationPreferenceDto>;
