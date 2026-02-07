namespace ExoChat.Application.Common.Interfaces;

public interface IPresenceService
{
    Task SetUserOnlineAsync(string userId, string connectionId, CancellationToken cancellationToken = default);
    Task SetUserOfflineAsync(string userId, string connectionId, CancellationToken cancellationToken = default);
    Task RefreshHeartbeatAsync(string userId, CancellationToken cancellationToken = default);
    Task<bool> IsUserOnlineAsync(string userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> GetOnlineUserIdsAsync(IEnumerable<string> userIds, CancellationToken cancellationToken = default);
    Task SetTypingAsync(string userId, string displayName, Guid conversationId, CancellationToken cancellationToken = default);
    Task ClearTypingAsync(string userId, Guid conversationId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TypingUserInfo>> GetTypingUsersAsync(Guid conversationId, CancellationToken cancellationToken = default);
}

public record TypingUserInfo(string UserId, string DisplayName);
