using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Notifications.Commands;

public class SubscribePushCommandHandler(
    IPushSubscriptionRepository pushSubscriptionRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<SubscribePushCommand>
{
    public async Task Handle(SubscribePushCommand request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        // Remove existing subscription for this endpoint
        var existing = await pushSubscriptionRepository.GetByEndpointAsync(request.Endpoint, cancellationToken);
        if (existing is not null)
            pushSubscriptionRepository.Delete(existing);

        var subscription = new PushSubscription
        {
            UserId = currentUser.Id,
            Endpoint = request.Endpoint,
            P256dhKey = request.P256dhKey,
            AuthKey = request.AuthKey,
            UserAgent = request.UserAgent
        };

        await pushSubscriptionRepository.AddAsync(subscription, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
