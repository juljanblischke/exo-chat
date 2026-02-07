using System.IO.Compression;
using System.Text.Json;
using ExoChat.Application.Common.Interfaces;
using ExoChat.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ExoChat.Infrastructure.Services;

public class DataExportService(
    ExoChatDbContext dbContext,
    IFileStorageService fileStorageService,
    ILogger<DataExportService> logger) : IDataExportService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async Task<string> GenerateExportAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Generating data export for user {UserId}", userId);

        var user = await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        var messages = await dbContext.Messages
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(m => m.SenderId == userId)
            .Select(m => new
            {
                m.Id,
                m.ConversationId,
                m.Content,
                m.MessageType,
                m.IsEncrypted,
                m.CreatedAt,
                m.EditedAt,
                m.DeletedAt
            })
            .ToListAsync(cancellationToken);

        var conversations = await dbContext.Participants
            .AsNoTracking()
            .Where(p => p.UserId == userId)
            .Select(p => new
            {
                p.ConversationId,
                p.Role,
                p.JoinedAt,
                ConversationType = p.Conversation.Type,
                GroupName = p.Conversation.Group != null ? p.Conversation.Group.Name : null
            })
            .ToListAsync(cancellationToken);

        var files = await dbContext.FileAttachments
            .AsNoTracking()
            .Where(f => f.Message.SenderId == userId)
            .Select(f => new
            {
                f.Id,
                f.FileName,
                f.ContentType,
                f.Size,
                f.CreatedAt
            })
            .ToListAsync(cancellationToken);

        var consents = await dbContext.UserConsents
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .Select(c => new
            {
                c.ConsentType,
                c.IsGranted,
                c.GrantedAt,
                c.RevokedAt,
                c.PolicyVersion
            })
            .ToListAsync(cancellationToken);

        var exportData = new
        {
            ExportedAt = DateTime.UtcNow,
            Profile = user is null ? null : new
            {
                user.Id,
                user.DisplayName,
                user.AvatarUrl,
                user.CreatedAt
            },
            Messages = messages,
            Conversations = conversations,
            Files = files,
            Consents = consents
        };

        using var memoryStream = new MemoryStream();
        using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
        {
            var jsonEntry = archive.CreateEntry("export.json");
            await using var entryStream = jsonEntry.Open();
            await JsonSerializer.SerializeAsync(entryStream, exportData, JsonOptions, cancellationToken);
        }

        memoryStream.Position = 0;
        var storageKey = await fileStorageService.UploadFileAsync(
            memoryStream,
            $"data-export-{userId}.zip",
            "application/zip",
            cancellationToken);

        logger.LogInformation("Data export generated for user {UserId}: {StorageKey}", userId, storageKey);
        return storageKey;
    }
}
