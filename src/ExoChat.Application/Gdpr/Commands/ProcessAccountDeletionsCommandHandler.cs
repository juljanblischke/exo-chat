using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities;
using ExoChat.Domain.Enums;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ExoChat.Application.Gdpr.Commands;

public class ProcessAccountDeletionsCommandHandler(
    IRepository<AccountDeletionRequest> deletionRepository,
    IAccountDeletionService accountDeletionService,
    IAuditLogService auditLogService,
    IUnitOfWork unitOfWork,
    ILogger<ProcessAccountDeletionsCommandHandler> logger) : IRequestHandler<ProcessAccountDeletionsCommand, int>
{
    public async Task<int> Handle(ProcessAccountDeletionsCommand request, CancellationToken cancellationToken)
    {
        var expiredRequests = await deletionRepository.FindAsync(
            d => d.Status == AccountDeletionStatus.Pending && d.GracePeriodEndsAt <= DateTime.UtcNow,
            cancellationToken);

        var processedCount = 0;

        foreach (var deletionRequest in expiredRequests)
        {
            try
            {
                deletionRequest.Status = AccountDeletionStatus.Processing;
                await unitOfWork.SaveChangesAsync(cancellationToken);

                await accountDeletionService.DeleteUserDataAsync(deletionRequest.UserId, cancellationToken);

                deletionRequest.Status = AccountDeletionStatus.Completed;
                deletionRequest.DeletedAt = DateTime.UtcNow;
                await unitOfWork.SaveChangesAsync(cancellationToken);

                await auditLogService.LogAsync(
                    AuditAction.AccountDeleted,
                    nameof(User),
                    deletionRequest.UserId.ToString(),
                    cancellationToken: cancellationToken);

                processedCount++;
                logger.LogInformation("Account deletion completed for user {UserId}", deletionRequest.UserId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to process account deletion for user {UserId}", deletionRequest.UserId);
                deletionRequest.Status = AccountDeletionStatus.Pending;
                await unitOfWork.SaveChangesAsync(cancellationToken);
            }
        }

        return processedCount;
    }
}
