namespace ExoChat.Application.Encryption.DTOs;

public record KeyUploadDto(
    string IdentityPublicKey,
    string IdentityPrivateKeyEncrypted,
    SignedPreKeyUploadDto SignedPreKey,
    IReadOnlyList<OneTimePreKeyUploadDto> OneTimePreKeys);

public record SignedPreKeyUploadDto(
    int KeyId,
    string PublicKey,
    string PrivateKeyEncrypted,
    string Signature);

public record OneTimePreKeyUploadDto(
    int KeyId,
    string PublicKey,
    string PrivateKeyEncrypted);
