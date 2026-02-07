using ExoChat.Application.Gdpr.DTOs;
using ExoChat.Domain.Enums;
using MediatR;

namespace ExoChat.Application.Gdpr.Commands;

public record UpdateConsentCommand(ConsentType ConsentType, bool IsGranted) : IRequest<UserConsentDto>;
