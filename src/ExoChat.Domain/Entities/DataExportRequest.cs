using ExoChat.Domain.Common;
using ExoChat.Domain.Enums;

namespace ExoChat.Domain.Entities;

public class DataExportRequest : BaseEntity
{
    public Guid UserId { get; set; }
    public DataExportStatus Status { get; set; } = DataExportStatus.Pending;
    public DateTime? CompletedAt { get; set; }
    public string? DownloadUrl { get; set; }
    public string? StorageKey { get; set; }
    public DateTime? ExpiresAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
}
