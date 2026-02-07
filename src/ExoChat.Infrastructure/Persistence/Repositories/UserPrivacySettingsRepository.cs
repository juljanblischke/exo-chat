using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Infrastructure.Persistence.Repositories;

public class UserPrivacySettingsRepository(ExoChatDbContext context) : Repository<UserPrivacySettings>(context), IUserPrivacySettingsRepository
{
    public async Task<UserPrivacySettings?> GetByUserIdAsync(
        Guid userId, CancellationToken cancellationToken = default)
        => await DbSet.FirstOrDefaultAsync(s => s.UserId == userId, cancellationToken);
}
