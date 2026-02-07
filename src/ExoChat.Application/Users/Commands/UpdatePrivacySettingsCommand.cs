using ExoChat.Application.Users.DTOs;
using ExoChat.Domain.Enums;
using MediatR;

namespace ExoChat.Application.Users.Commands;

public record UpdatePrivacySettingsCommand(
    bool ReadReceiptsEnabled,
    StatusVisibility OnlineStatusVisibility) : IRequest<UserPrivacySettingsDto>;
