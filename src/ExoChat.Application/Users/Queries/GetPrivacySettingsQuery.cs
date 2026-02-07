using ExoChat.Application.Users.DTOs;
using MediatR;

namespace ExoChat.Application.Users.Queries;

public record GetPrivacySettingsQuery : IRequest<UserPrivacySettingsDto>;
