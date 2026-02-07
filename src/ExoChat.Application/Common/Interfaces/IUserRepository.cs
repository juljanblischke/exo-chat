using ExoChat.Domain.Entities;

namespace ExoChat.Application.Common.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByKeycloakIdAsync(string keycloakId, CancellationToken cancellationToken = default);
}
