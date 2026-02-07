using ExoChat.Application.Notifications.Commands;
using ExoChat.Application.Notifications.Queries;
using ExoChat.Shared.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ExoChat.Api.Controllers;

[Route("api/v{version:apiVersion}/notifications")]
public class NotificationsController(IMediator mediator) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] bool? isRead = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new GetNotificationsQuery(isRead, page, pageSize), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] SubscribePushRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new SubscribePushCommand(request.Endpoint, request.P256dhKey, request.AuthKey, request.UserAgent), cancellationToken);
        return Ok(ApiResponse.Ok());
    }

    [HttpDelete("subscribe")]
    public async Task<IActionResult> Unsubscribe([FromBody] UnsubscribePushRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new UnsubscribePushCommand(request.Endpoint), cancellationToken);
        return Ok(ApiResponse.Ok());
    }

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellationToken)
    {
        await mediator.Send(new MarkNotificationReadCommand(id), cancellationToken);
        return Ok(ApiResponse.Ok());
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellationToken)
    {
        await mediator.Send(new MarkAllNotificationsReadCommand(), cancellationToken);
        return Ok(ApiResponse.Ok());
    }

    [HttpGet("preferences")]
    public async Task<IActionResult> GetPreferences(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetNotificationPreferencesQuery(), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpPut("preferences")]
    public async Task<IActionResult> UpdatePreferences([FromBody] UpdateNotificationPreferencesRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new UpdateNotificationPreferencesCommand(request.ConversationId, request.EnablePush, request.EnableSound, request.EnableDesktop, request.MutedUntil),
            cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }
}

public record SubscribePushRequest(string Endpoint, string P256dhKey, string AuthKey, string? UserAgent = null);
public record UnsubscribePushRequest(string Endpoint);
public record UpdateNotificationPreferencesRequest(Guid? ConversationId, bool EnablePush, bool EnableSound, bool EnableDesktop, DateTime? MutedUntil);
