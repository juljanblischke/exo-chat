using ExoChat.Domain.Common;

namespace ExoChat.Domain.Entities;

public class PushSubscription : BaseEntity
{
    public Guid UserId { get; set; }
    public string Endpoint { get; set; } = string.Empty;
    public string P256dhKey { get; set; } = string.Empty;
    public string AuthKey { get; set; } = string.Empty;
    public string? UserAgent { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
}
