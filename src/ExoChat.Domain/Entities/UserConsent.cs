using ExoChat.Domain.Common;
using ExoChat.Domain.Enums;

namespace ExoChat.Domain.Entities;

public class UserConsent : BaseEntity
{
    public Guid UserId { get; set; }
    public ConsentType ConsentType { get; set; }
    public bool IsGranted { get; set; }
    public DateTime? GrantedAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string PolicyVersion { get; set; } = "1.0";

    // Navigation properties
    public User User { get; set; } = null!;
}
