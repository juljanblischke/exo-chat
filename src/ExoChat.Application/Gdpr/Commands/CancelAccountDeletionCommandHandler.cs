using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities;
using ExoChat.Domain.Enums;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Gdpr.Commands;

public class CancelAccountDeletionCommandHandler(
    ICurrentUserService currentUserService,
    IUserRepository userRepository,
    IRepository<AccountDeletionRequest> deletionRepository,
    IAuditLogService auditLogService,
    IUnitOfWork unitOfWork) : IRequestHandler<CancelAccountDeletionCommand>
{
    public async Task Handle(CancelAccountDeletionCommand request, CancellationToken cancellationToken)
    {
        var keycloakId = currentUserService.UserId
            ?? throw new ForbiddenException("User is not authenticated.");

        var user = await userRepository.GetByKeycloakIdAsync(keycloakId, cancellationToken)
            ?? throw new NotFoundException("User", keycloakId);

        var pending = await deletionRepository.FindAsync(
            d => d.UserId == user.Id && d.Status == AccountDeletionStatus.Pending, cancellationToken);

        var deletionRequest = pending.FirstOrDefault()
            ?? throw new NotFoundException(nameof(AccountDeletionRequest), user.Id);

        deletionRequest.Status = AccountDeletionStatus.Cancelled;
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditLogService.LogAsync(
            AuditAction.AccountDeletionCancelled,
            nameof(AccountDeletionRequest),
            deletionRequest.Id.ToString(),
            user.Id,
            cancellationToken: cancellationToken);
    }
}
