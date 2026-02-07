using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities;
using ExoChat.Domain.Enums;
using ExoChat.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;

namespace ExoChat.Infrastructure.Services;

public class AuditLogService(IServiceScopeFactory scopeFactory) : IAuditLogService
{
    public async Task LogAsync(
        AuditAction action,
        string entityType,
        string? entityId = null,
        Guid? userId = null,
        string? ipAddress = null,
        string? userAgent = null,
        string? details = null,
        CancellationToken cancellationToken = default)
    {
        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ExoChatDbContext>();

        var entry = new AuditLogEntry
        {
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            Details = details
        };

        dbContext.AuditLogEntries.Add(entry);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
