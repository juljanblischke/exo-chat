using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Common.Models;
using ExoChat.Application.Notifications.DTOs;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Notifications.Queries;

public class GetNotificationsQueryHandler(
    INotificationRepository notificationRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService) : IRequestHandler<GetNotificationsQuery, PagedResult<NotificationDto>>
{
    public async Task<PagedResult<NotificationDto>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var notifications = await notificationRepository.GetByUserIdAsync(
            currentUser.Id, request.IsRead, request.Page, request.PageSize, cancellationToken);

        var unreadCount = await notificationRepository.GetUnreadCountAsync(currentUser.Id, cancellationToken);
        var totalCount = request.IsRead.HasValue
            ? notifications.Count
            : unreadCount + (await notificationRepository.GetByUserIdAsync(currentUser.Id, true, 1, int.MaxValue, cancellationToken)).Count;

        var dtos = notifications.Select(n => new NotificationDto(
            n.Id,
            n.Type,
            n.Title,
            n.Body,
            n.Data,
            n.IsRead,
            n.ConversationId,
            n.CreatedAt)).ToList();

        return new PagedResult<NotificationDto>(dtos, totalCount, request.Page, request.PageSize);
    }
}
