using ExoChat.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Infrastructure.Persistence.Repositories;

public interface IUserRepository : Application.Common.Interfaces.IRepository<User>
{
    Task<User?> GetByKeycloakIdAsync(string keycloakId, CancellationToken cancellationToken = default);
}

public class UserRepository(ExoChatDbContext context) : Repository<User>(context), IUserRepository
{
    public async Task<User?> GetByKeycloakIdAsync(string keycloakId, CancellationToken cancellationToken = default)
        => await DbSet.FirstOrDefaultAsync(u => u.KeycloakId == keycloakId, cancellationToken);
}
