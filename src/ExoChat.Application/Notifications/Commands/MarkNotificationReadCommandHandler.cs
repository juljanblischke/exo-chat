using ExoChat.Application.Common.Interfaces;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Notifications.Commands;

public class MarkNotificationReadCommandHandler(
    INotificationRepository notificationRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<MarkNotificationReadCommand>
{
    public async Task Handle(MarkNotificationReadCommand request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var notification = await notificationRepository.GetByIdAsync(request.NotificationId, cancellationToken)
            ?? throw new NotFoundException("Notification", request.NotificationId);

        if (notification.UserId != currentUser.Id)
            throw new ForbiddenException("You can only mark your own notifications as read.");

        notification.IsRead = true;
        notificationRepository.Update(notification);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
