using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Infrastructure.Persistence.Repositories;

public class ConversationRepository(ExoChatDbContext context) : Repository<Conversation>(context), IConversationRepository
{
    public async Task<Conversation?> GetWithParticipantsAsync(Guid id, CancellationToken cancellationToken = default)
        => await DbSet.Include(c => c.Participants).ThenInclude(p => p.User)
            .Include(c => c.Group)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
}
