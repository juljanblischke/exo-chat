using ExoChat.Application.Users.DTOs;
using MediatR;

namespace ExoChat.Application.Users.Commands;

public record UpdateProfileCommand(
    string? DisplayName,
    string? AvatarUrl,
    string? StatusMessage) : IRequest<UserProfileDto>;
