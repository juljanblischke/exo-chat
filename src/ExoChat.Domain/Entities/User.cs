using ExoChat.Domain.Common;
using ExoChat.Domain.Enums;

namespace ExoChat.Domain.Entities;

public class User : BaseEntity
{
    public string KeycloakId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public DateTime? LastSeenAt { get; set; }
    public OnlineStatus OnlineStatus { get; set; } = OnlineStatus.Offline;

    // Navigation properties
    public ICollection<Participant> Participants { get; set; } = new List<Participant>();
    public ICollection<Message> SentMessages { get; set; } = new List<Message>();
}
