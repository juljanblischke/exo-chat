using ExoChat.Domain.Enums;

namespace ExoChat.Application.Messages.DTOs;

public record MessageDto(
    Guid Id,
    Guid ConversationId,
    Guid SenderId,
    string SenderDisplayName,
    string? SenderAvatarUrl,
    string Content,
    MessageType MessageType,
    bool IsEncrypted,
    DateTime CreatedAt,
    DateTime? EditedAt,
    DateTime? DeletedAt,
    IReadOnlyList<FileAttachmentDto> Attachments);

public record FileAttachmentDto(
    Guid Id,
    string FileName,
    string ContentType,
    long Size,
    string StorageKey,
    string? ThumbnailKey);
