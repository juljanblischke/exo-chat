namespace ExoChat.Application.Encryption.DTOs;

public record EncryptedMessageDto(
    string CipherText,
    int SenderKeyId,
    int ReceiverKeyId,
    int MessageNumber,
    int ChainIndex);
