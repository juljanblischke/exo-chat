using ExoChat.Domain.Entities;

namespace ExoChat.Application.Common.Interfaces;

public interface INotificationPreferenceRepository : IRepository<NotificationPreference>
{
    Task<NotificationPreference?> GetGlobalPreferenceAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<NotificationPreference?> GetConversationPreferenceAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NotificationPreference>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}
