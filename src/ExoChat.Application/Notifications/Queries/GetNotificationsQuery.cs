using ExoChat.Application.Common.Models;
using ExoChat.Application.Notifications.DTOs;
using MediatR;

namespace ExoChat.Application.Notifications.Queries;

public record GetNotificationsQuery(
    bool? IsRead = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<NotificationDto>>;
