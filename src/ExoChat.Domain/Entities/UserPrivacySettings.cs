using ExoChat.Domain.Common;
using ExoChat.Domain.Enums;

namespace ExoChat.Domain.Entities;

public class UserPrivacySettings : BaseEntity
{
    public Guid UserId { get; set; }
    public bool ReadReceiptsEnabled { get; set; } = true;
    public StatusVisibility OnlineStatusVisibility { get; set; } = StatusVisibility.Everyone;

    // Navigation properties
    public User User { get; set; } = null!;
}
