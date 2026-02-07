using ExoChat.Domain.Common;

namespace ExoChat.Domain.Entities.Encryption;

public class IdentityKey : BaseEntity
{
    public Guid UserId { get; set; }
    public byte[] PublicKey { get; set; } = [];
    public byte[] PrivateKeyEncrypted { get; set; } = [];

    // Navigation properties
    public User User { get; set; } = null!;
}
