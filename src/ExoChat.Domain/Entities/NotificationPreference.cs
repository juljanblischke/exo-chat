using ExoChat.Domain.Common;

namespace ExoChat.Domain.Entities;

public class NotificationPreference : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid? ConversationId { get; set; }
    public bool EnablePush { get; set; } = true;
    public bool EnableSound { get; set; } = true;
    public bool EnableDesktop { get; set; } = true;
    public DateTime? MutedUntil { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Conversation? Conversation { get; set; }
}
