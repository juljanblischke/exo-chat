namespace ExoChat.Application.Common.Interfaces;

public interface IAccountDeletionService
{
    Task DeleteUserDataAsync(Guid userId, CancellationToken cancellationToken = default);
}
