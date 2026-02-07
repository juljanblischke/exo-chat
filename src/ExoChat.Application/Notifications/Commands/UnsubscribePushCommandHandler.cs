using ExoChat.Application.Common.Interfaces;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Notifications.Commands;

public class UnsubscribePushCommandHandler(
    IPushSubscriptionRepository pushSubscriptionRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<UnsubscribePushCommand>
{
    public async Task Handle(UnsubscribePushCommand request, CancellationToken cancellationToken)
    {
        _ = currentUserService.UserId ?? throw new ForbiddenException();

        await pushSubscriptionRepository.DeleteByEndpointAsync(request.Endpoint, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
