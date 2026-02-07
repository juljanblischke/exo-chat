namespace ExoChat.Application.Messages.DTOs;

public record SearchResultDto(
    Guid MessageId,
    string ContentSnippet,
    Guid ConversationId,
    string? ConversationName,
    string SenderName,
    string? SenderAvatarUrl,
    DateTime SentAt);
