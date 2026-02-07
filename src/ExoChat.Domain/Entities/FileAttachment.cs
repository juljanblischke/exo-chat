using ExoChat.Domain.Common;

namespace ExoChat.Domain.Entities;

public class FileAttachment : BaseEntity
{
    public Guid MessageId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
    public string StorageKey { get; set; } = string.Empty;
    public string? ThumbnailKey { get; set; }

    // Navigation properties
    public Message Message { get; set; } = null!;
}
