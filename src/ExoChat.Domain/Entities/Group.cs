using ExoChat.Domain.Common;

namespace ExoChat.Domain.Entities;

public class Group : BaseEntity
{
    public Guid ConversationId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? AvatarUrl { get; set; }

    // Navigation properties
    public Conversation Conversation { get; set; } = null!;
}
