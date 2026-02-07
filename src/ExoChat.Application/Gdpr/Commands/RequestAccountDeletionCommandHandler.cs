using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Gdpr.DTOs;
using ExoChat.Domain.Entities;
using ExoChat.Domain.Enums;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Gdpr.Commands;

public class RequestAccountDeletionCommandHandler(
    ICurrentUserService currentUserService,
    IUserRepository userRepository,
    IRepository<AccountDeletionRequest> deletionRepository,
    IAuditLogService auditLogService,
    IUnitOfWork unitOfWork) : IRequestHandler<RequestAccountDeletionCommand, AccountDeletionDto>
{
    private const int GracePeriodDays = 30;

    public async Task<AccountDeletionDto> Handle(RequestAccountDeletionCommand request, CancellationToken cancellationToken)
    {
        var keycloakId = currentUserService.UserId
            ?? throw new ForbiddenException("User is not authenticated.");

        var user = await userRepository.GetByKeycloakIdAsync(keycloakId, cancellationToken)
            ?? throw new NotFoundException("User", keycloakId);

        var existing = await deletionRepository.FindAsync(
            d => d.UserId == user.Id && d.Status == AccountDeletionStatus.Pending, cancellationToken);

        if (existing.Count > 0)
            throw new ConflictException("An account deletion request is already pending.");

        var deletionRequest = new AccountDeletionRequest
        {
            UserId = user.Id,
            Status = AccountDeletionStatus.Pending,
            GracePeriodEndsAt = DateTime.UtcNow.AddDays(GracePeriodDays),
            Reason = request.Reason
        };

        await deletionRepository.AddAsync(deletionRequest, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditLogService.LogAsync(
            AuditAction.AccountDeletionRequested,
            nameof(AccountDeletionRequest),
            deletionRequest.Id.ToString(),
            user.Id,
            cancellationToken: cancellationToken);

        return new AccountDeletionDto(
            deletionRequest.Id,
            deletionRequest.Status,
            deletionRequest.CreatedAt,
            deletionRequest.GracePeriodEndsAt,
            deletionRequest.DeletedAt);
    }
}
