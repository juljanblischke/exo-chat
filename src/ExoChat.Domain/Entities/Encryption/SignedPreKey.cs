using ExoChat.Domain.Common;

namespace ExoChat.Domain.Entities.Encryption;

public class SignedPreKey : BaseEntity
{
    public Guid UserId { get; set; }
    public int KeyId { get; set; }
    public byte[] PublicKey { get; set; } = [];
    public byte[] PrivateKeyEncrypted { get; set; } = [];
    public byte[] Signature { get; set; } = [];
    public DateTime ExpiresAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
}
