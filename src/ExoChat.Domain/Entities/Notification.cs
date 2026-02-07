using ExoChat.Domain.Common;
using ExoChat.Domain.Enums;

namespace ExoChat.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? Data { get; set; }
    public bool IsRead { get; set; }
    public Guid? ConversationId { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
}
