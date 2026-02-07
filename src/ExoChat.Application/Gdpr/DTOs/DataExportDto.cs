using ExoChat.Domain.Enums;

namespace ExoChat.Application.Gdpr.DTOs;

public record DataExportDto(
    Guid Id,
    DataExportStatus Status,
    DateTime RequestedAt,
    DateTime? CompletedAt,
    string? DownloadUrl,
    DateTime? ExpiresAt);
