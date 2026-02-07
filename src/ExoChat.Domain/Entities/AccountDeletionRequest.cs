using ExoChat.Domain.Common;
using ExoChat.Domain.Enums;

namespace ExoChat.Domain.Entities;

public class AccountDeletionRequest : BaseEntity
{
    public Guid UserId { get; set; }
    public AccountDeletionStatus Status { get; set; } = AccountDeletionStatus.Pending;
    public DateTime GracePeriodEndsAt { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? Reason { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
}
