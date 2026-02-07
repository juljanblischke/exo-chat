using ExoChat.Domain.Common;
using ExoChat.Domain.Enums;

namespace ExoChat.Domain.Entities;

public class Participant : BaseEntity
{
    public Guid ConversationId { get; set; }
    public Guid UserId { get; set; }
    public ParticipantRole Role { get; set; } = ParticipantRole.Member;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public Guid? LastReadMessageId { get; set; }

    // Navigation properties
    public Conversation Conversation { get; set; } = null!;
    public User User { get; set; } = null!;
    public Message? LastReadMessage { get; set; }
}
