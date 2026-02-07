using ExoChat.Application.Conversations.Commands;
using ExoChat.Application.Conversations.Queries;
using ExoChat.Application.Messages.Commands;
using ExoChat.Application.Messages.Queries;
using ExoChat.Shared.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ExoChat.Api.Controllers;

public class ConversationsController(IMediator mediator) : ApiControllerBase
{
    [HttpPost("direct")]
    public async Task<IActionResult> CreateDirect([FromBody] CreateDirectConversationRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new CreateDirectConversationCommand(request.OtherUserId), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpPost("group")]
    public async Task<IActionResult> CreateGroup([FromBody] CreateGroupConversationRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new CreateGroupConversationCommand(request.Name, request.Description, request.MemberUserIds), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpGet]
    public async Task<IActionResult> GetConversations([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new GetConversationsQuery(page, pageSize), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetConversationByIdQuery(id), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }
}

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, [FromBody] MarkAsReadRequest? request, CancellationToken cancellationToken)
    {
        var previousUnreadCount = await mediator.Send(
            new MarkMessagesAsReadCommand(id, request?.UpToMessageId), cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { MarkedAsRead = true, PreviousUnreadCount = previousUnreadCount }));
    }

    [HttpGet("{id:guid}/unread-count")]
    public async Task<IActionResult> GetUnreadCount(Guid id, CancellationToken cancellationToken)
    {
        var count = await mediator.Send(new GetUnreadCountQuery(id), cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { UnreadCount = count }));
    }
}

public record CreateDirectConversationRequest(Guid OtherUserId);
public record CreateGroupConversationRequest(string Name, string? Description, List<Guid> MemberUserIds);
public record MarkAsReadRequest(Guid? UpToMessageId);
