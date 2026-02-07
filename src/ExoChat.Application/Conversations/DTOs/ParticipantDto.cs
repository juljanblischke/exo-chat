using ExoChat.Domain.Enums;

namespace ExoChat.Application.Conversations.DTOs;

public record ParticipantDto(
    Guid UserId,
    string DisplayName,
    string? AvatarUrl,
    ParticipantRole Role,
    DateTime JoinedAt,
    Guid? LastReadMessageId);
