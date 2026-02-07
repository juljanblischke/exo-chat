using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Gdpr.DTOs;
using ExoChat.Domain.Entities;
using ExoChat.Domain.Enums;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Gdpr.Commands;

public class UpdateConsentCommandHandler(
    ICurrentUserService currentUserService,
    IUserRepository userRepository,
    IRepository<UserConsent> consentRepository,
    IAuditLogService auditLogService,
    IUnitOfWork unitOfWork) : IRequestHandler<UpdateConsentCommand, UserConsentDto>
{
    public async Task<UserConsentDto> Handle(UpdateConsentCommand request, CancellationToken cancellationToken)
    {
        var keycloakId = currentUserService.UserId
            ?? throw new ForbiddenException("User is not authenticated.");

        var user = await userRepository.GetByKeycloakIdAsync(keycloakId, cancellationToken)
            ?? throw new NotFoundException("User", keycloakId);

        var consents = await consentRepository.FindAsync(
            c => c.UserId == user.Id && c.ConsentType == request.ConsentType, cancellationToken);

        var consent = consents.FirstOrDefault();

        if (consent is null)
        {
            consent = new UserConsent
            {
                UserId = user.Id,
                ConsentType = request.ConsentType,
                IsGranted = request.IsGranted,
                GrantedAt = request.IsGranted ? DateTime.UtcNow : null,
                RevokedAt = request.IsGranted ? null : DateTime.UtcNow
            };
            await consentRepository.AddAsync(consent, cancellationToken);
        }
        else
        {
            consent.IsGranted = request.IsGranted;
            if (request.IsGranted)
            {
                consent.GrantedAt = DateTime.UtcNow;
                consent.RevokedAt = null;
            }
            else
            {
                consent.RevokedAt = DateTime.UtcNow;
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditLogService.LogAsync(
            AuditAction.ConsentUpdated,
            nameof(UserConsent),
            consent.Id.ToString(),
            user.Id,
            details: $"ConsentType={request.ConsentType}, IsGranted={request.IsGranted}",
            cancellationToken: cancellationToken);

        return new UserConsentDto(
            consent.ConsentType,
            consent.IsGranted,
            consent.GrantedAt,
            consent.RevokedAt,
            consent.PolicyVersion);
    }
}
