using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Gdpr.DTOs;
using ExoChat.Domain.Entities;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Gdpr.Queries;

public class GetUserConsentsQueryHandler(
    ICurrentUserService currentUserService,
    IUserRepository userRepository,
    IRepository<UserConsent> consentRepository) : IRequestHandler<GetUserConsentsQuery, IReadOnlyList<UserConsentDto>>
{
    public async Task<IReadOnlyList<UserConsentDto>> Handle(GetUserConsentsQuery request, CancellationToken cancellationToken)
    {
        var keycloakId = currentUserService.UserId
            ?? throw new ForbiddenException("User is not authenticated.");

        var user = await userRepository.GetByKeycloakIdAsync(keycloakId, cancellationToken)
            ?? throw new NotFoundException("User", keycloakId);

        var consents = await consentRepository.FindAsync(
            c => c.UserId == user.Id, cancellationToken);

        return consents.Select(c => new UserConsentDto(
            c.ConsentType,
            c.IsGranted,
            c.GrantedAt,
            c.RevokedAt,
            c.PolicyVersion)).ToList();
    }
}
