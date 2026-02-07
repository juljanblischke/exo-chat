using ExoChat.Application.Common.Interfaces;
using ExoChat.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ExoChat.Infrastructure.Services;

public class AccountDeletionService(
    ExoChatDbContext dbContext,
    IFileStorageService fileStorageService,
    ILogger<AccountDeletionService> logger) : IAccountDeletionService
{
    public async Task DeleteUserDataAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Starting data deletion for user {UserId}", userId);

        // Delete file attachments from MinIO
        var fileAttachments = await dbContext.FileAttachments
            .Where(f => f.Message.SenderId == userId)
            .ToListAsync(cancellationToken);

        foreach (var file in fileAttachments)
        {
            try
            {
                await fileStorageService.DeleteFileAsync(file.StorageKey, cancellationToken);
                if (file.ThumbnailKey is not null)
                    await fileStorageService.DeleteFileAsync(file.ThumbnailKey, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to delete file {StorageKey} from storage", file.StorageKey);
            }
        }

        // Delete data export files
        var exports = await dbContext.DataExportRequests
            .Where(e => e.UserId == userId && e.StorageKey != null)
            .ToListAsync(cancellationToken);

        foreach (var export in exports)
        {
            try
            {
                if (export.StorageKey is not null)
                    await fileStorageService.DeleteFileAsync(export.StorageKey, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to delete export file {StorageKey}", export.StorageKey);
            }
        }

        // Delete messages (hard delete, ignoring soft-delete filter)
        var messages = await dbContext.Messages
            .IgnoreQueryFilters()
            .Where(m => m.SenderId == userId)
            .ToListAsync(cancellationToken);

        dbContext.Messages.RemoveRange(messages);

        // Delete participations
        var participants = await dbContext.Participants
            .Where(p => p.UserId == userId)
            .ToListAsync(cancellationToken);

        dbContext.Participants.RemoveRange(participants);

        // Delete consents
        var consents = await dbContext.UserConsents
            .Where(c => c.UserId == userId)
            .ToListAsync(cancellationToken);

        dbContext.UserConsents.RemoveRange(consents);

        // Delete export requests
        dbContext.DataExportRequests.RemoveRange(exports);

        // Anonymize audit log entries (keep for compliance but remove PII)
        var auditEntries = await dbContext.AuditLogEntries
            .Where(a => a.UserId == userId)
            .ToListAsync(cancellationToken);

        foreach (var entry in auditEntries)
        {
            entry.UserId = null;
            entry.IpAddress = null;
            entry.UserAgent = null;
        }

        // Delete the user
        var user = await dbContext.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user is not null)
        {
            dbContext.Users.Remove(user);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Data deletion completed for user {UserId}", userId);
    }
}
