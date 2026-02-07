using ExoChat.Domain.Common;

namespace ExoChat.Domain.Entities;

public class BlockedUser : BaseEntity
{
    public Guid BlockerUserId { get; set; }
    public Guid BlockedUserId { get; set; }

    // Navigation properties
    public User BlockerUser { get; set; } = null!;
    public User BlockedUserNavigation { get; set; } = null!;
}
