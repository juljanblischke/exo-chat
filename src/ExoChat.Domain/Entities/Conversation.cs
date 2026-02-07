using ExoChat.Domain.Common;
using ExoChat.Domain.Enums;

namespace ExoChat.Domain.Entities;

public class Conversation : BaseEntity
{
    public ConversationType Type { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public Group? Group { get; set; }
    public ICollection<Participant> Participants { get; set; } = new List<Participant>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
