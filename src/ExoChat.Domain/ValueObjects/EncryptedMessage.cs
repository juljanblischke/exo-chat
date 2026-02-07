namespace ExoChat.Domain.ValueObjects;

public record EncryptedMessage(
    byte[] CipherText,
    int SenderKeyId,
    int ReceiverKeyId,
    int MessageNumber,
    int ChainIndex);
