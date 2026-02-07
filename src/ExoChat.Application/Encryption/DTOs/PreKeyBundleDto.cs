namespace ExoChat.Application.Encryption.DTOs;

public record PreKeyBundleDto(
    Guid UserId,
    string IdentityKey,
    int SignedPreKeyId,
    string SignedPreKey,
    string SignedPreKeySignature,
    int? OneTimePreKeyId,
    string? OneTimePreKey);
