using ExoChat.Domain.Enums;

namespace ExoChat.Application.Common.Interfaces;

public interface IAuditLogService
{
    Task LogAsync(
        AuditAction action,
        string entityType,
        string? entityId = null,
        Guid? userId = null,
        string? ipAddress = null,
        string? userAgent = null,
        string? details = null,
        CancellationToken cancellationToken = default);
}
