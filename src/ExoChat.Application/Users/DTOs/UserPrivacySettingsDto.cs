using ExoChat.Domain.Enums;

namespace ExoChat.Application.Users.DTOs;

public record UserPrivacySettingsDto(
    bool ReadReceiptsEnabled,
    StatusVisibility OnlineStatusVisibility);
