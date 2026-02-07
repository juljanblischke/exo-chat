using ExoChat.Domain.Entities;

namespace ExoChat.Application.Common.Interfaces;

public interface IUserPrivacySettingsRepository : IRepository<UserPrivacySettings>
{
    Task<UserPrivacySettings?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}
