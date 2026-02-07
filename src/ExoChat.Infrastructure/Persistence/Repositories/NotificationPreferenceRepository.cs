using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Infrastructure.Persistence.Repositories;

public class NotificationPreferenceRepository(ExoChatDbContext context) : Repository<NotificationPreference>(context), INotificationPreferenceRepository
{
    public async Task<NotificationPreference?> GetGlobalPreferenceAsync(
        Guid userId, CancellationToken cancellationToken = default)
        => await DbSet.FirstOrDefaultAsync(p => p.UserId == userId && p.ConversationId == null, cancellationToken);

    public async Task<NotificationPreference?> GetConversationPreferenceAsync(
        Guid userId, Guid conversationId, CancellationToken cancellationToken = default)
        => await DbSet.FirstOrDefaultAsync(p => p.UserId == userId && p.ConversationId == conversationId, cancellationToken);

    public async Task<IReadOnlyList<NotificationPreference>> GetAllByUserIdAsync(
        Guid userId, CancellationToken cancellationToken = default)
        => await DbSet
            .Where(p => p.UserId == userId)
            .Include(p => p.Conversation)
                .ThenInclude(c => c!.Group)
            .ToListAsync(cancellationToken);
}
