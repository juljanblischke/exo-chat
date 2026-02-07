namespace ExoChat.Application.Users.DTOs;

public record UserProfileDto(
    Guid Id,
    string DisplayName,
    string? AvatarUrl,
    string? StatusMessage,
    string? Email);
