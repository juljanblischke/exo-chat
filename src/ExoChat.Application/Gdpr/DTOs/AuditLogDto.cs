using ExoChat.Domain.Enums;

namespace ExoChat.Application.Gdpr.DTOs;

public record AuditLogDto(
    Guid Id,
    Guid? UserId,
    AuditAction Action,
    string EntityType,
    string? EntityId,
    string? IpAddress,
    DateTime Timestamp,
    string? Details);
