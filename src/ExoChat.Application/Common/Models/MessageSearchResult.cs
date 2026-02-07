namespace ExoChat.Application.Common.Models;

public class MessageSearchResult
{
    public Guid MessageId { get; set; }
    public string ContentSnippet { get; set; } = string.Empty;
    public Guid ConversationId { get; set; }
    public string? ConversationName { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string? SenderAvatarUrl { get; set; }
    public DateTime SentAt { get; set; }
}
