namespace ExoChat.Application.Users.DTOs;

public record BlockedUserDto(
    Guid Id,
    Guid BlockedUserId,
    string BlockedUserDisplayName,
    string? BlockedUserAvatarUrl,
    DateTime BlockedAt);
