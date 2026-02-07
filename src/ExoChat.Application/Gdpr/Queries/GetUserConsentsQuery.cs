using ExoChat.Application.Gdpr.DTOs;
using MediatR;

namespace ExoChat.Application.Gdpr.Queries;

public record GetUserConsentsQuery : IRequest<IReadOnlyList<UserConsentDto>>;
