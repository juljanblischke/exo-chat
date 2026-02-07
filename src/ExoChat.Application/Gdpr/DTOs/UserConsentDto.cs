using ExoChat.Domain.Enums;

namespace ExoChat.Application.Gdpr.DTOs;

public record UserConsentDto(
    ConsentType ConsentType,
    bool IsGranted,
    DateTime? GrantedAt,
    DateTime? RevokedAt,
    string PolicyVersion);
