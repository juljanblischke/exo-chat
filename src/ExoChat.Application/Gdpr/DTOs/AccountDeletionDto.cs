using ExoChat.Domain.Enums;

namespace ExoChat.Application.Gdpr.DTOs;

public record AccountDeletionDto(
    Guid Id,
    AccountDeletionStatus Status,
    DateTime RequestedAt,
    DateTime GracePeriodEndsAt,
    DateTime? DeletedAt);
