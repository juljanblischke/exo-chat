using ExoChat.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using StackExchange.Redis;

namespace ExoChat.Infrastructure.Services;

public class RedisPresenceService : IPresenceService
{
    private readonly IConnectionMultiplexer _redis;
    private static readonly TimeSpan OnlineTtl = TimeSpan.FromSeconds(60);
    private static readonly TimeSpan TypingTtl = TimeSpan.FromSeconds(5);

    public RedisPresenceService(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Redis") ?? "localhost:6379";
        _redis = ConnectionMultiplexer.Connect(connectionString);
    }

    public async Task SetUserOnlineAsync(string userId, string connectionId, CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();
        var key = OnlineKey(userId);
        await db.StringSetAsync(key, connectionId, OnlineTtl);
    }

    public async Task SetUserOfflineAsync(string userId, string connectionId, CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();
        var key = OnlineKey(userId);
        var current = await db.StringGetAsync(key);
        if (current == connectionId)
        {
            await db.KeyDeleteAsync(key);
        }
    }

    public async Task RefreshHeartbeatAsync(string userId, CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();
        var key = OnlineKey(userId);
        await db.KeyExpireAsync(key, OnlineTtl);
    }

    public async Task<bool> IsUserOnlineAsync(string userId, CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();
        return await db.KeyExistsAsync(OnlineKey(userId));
    }

    public async Task<IReadOnlyList<string>> GetOnlineUserIdsAsync(IEnumerable<string> userIds, CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();
        var result = new List<string>();
        foreach (var userId in userIds)
        {
            if (await db.KeyExistsAsync(OnlineKey(userId)))
            {
                result.Add(userId);
            }
        }
        return result;
    }

    public async Task SetTypingAsync(string userId, string displayName, Guid conversationId, CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();
        var key = TypingKey(conversationId);
        var field = userId;
        await db.HashSetAsync(key, field, displayName);
        await db.KeyExpireAsync(key, TypingTtl);

        // Set per-user typing key with TTL for auto-cleanup
        var userTypingKey = TypingUserKey(conversationId, userId);
        await db.StringSetAsync(userTypingKey, displayName, TypingTtl);
    }

    public async Task ClearTypingAsync(string userId, Guid conversationId, CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();
        var key = TypingKey(conversationId);
        await db.HashDeleteAsync(key, userId);

        var userTypingKey = TypingUserKey(conversationId, userId);
        await db.KeyDeleteAsync(userTypingKey);
    }

    public async Task<IReadOnlyList<TypingUserInfo>> GetTypingUsersAsync(Guid conversationId, CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();
        var result = new List<TypingUserInfo>();
        var key = TypingKey(conversationId);
        var entries = await db.HashGetAllAsync(key);

        foreach (var entry in entries)
        {
            var userId = entry.Name.ToString();
            var userTypingKey = TypingUserKey(conversationId, userId);
            if (await db.KeyExistsAsync(userTypingKey))
            {
                result.Add(new TypingUserInfo(userId, entry.Value.ToString()));
            }
            else
            {
                // Clean up stale entry
                await db.HashDeleteAsync(key, userId);
            }
        }

        return result;
    }

    private static string OnlineKey(string userId) => $"presence:online:{userId}";
    private static string TypingKey(Guid conversationId) => $"presence:typing:{conversationId}";
    private static string TypingUserKey(Guid conversationId, string userId) => $"presence:typing:{conversationId}:{userId}";
}
