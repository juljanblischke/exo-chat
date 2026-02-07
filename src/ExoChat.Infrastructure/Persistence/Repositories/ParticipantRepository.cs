using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Infrastructure.Persistence.Repositories;

public class ParticipantRepository(ExoChatDbContext context) : Repository<Participant>(context), IParticipantRepository
{
    public async Task<IReadOnlyList<Participant>> GetByConversationIdAsync(
        Guid conversationId, CancellationToken cancellationToken = default)
        => await DbSet
            .Where(p => p.ConversationId == conversationId)
            .Include(p => p.User)
            .ToListAsync(cancellationToken);
}
