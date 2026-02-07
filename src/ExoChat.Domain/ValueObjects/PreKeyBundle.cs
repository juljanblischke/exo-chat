namespace ExoChat.Domain.ValueObjects;

public record PreKeyBundle(
    Guid UserId,
    byte[] IdentityKey,
    int SignedPreKeyId,
    byte[] SignedPreKey,
    byte[] SignedPreKeySignature,
    int? OneTimePreKeyId,
    byte[]? OneTimePreKey);
