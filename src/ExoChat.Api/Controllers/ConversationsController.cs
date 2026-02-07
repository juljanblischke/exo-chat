using ExoChat.Application.Conversations.Commands;
using ExoChat.Application.Conversations.Queries;
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

public record CreateDirectConversationRequest(Guid OtherUserId);
public record CreateGroupConversationRequest(string Name, string? Description, List<Guid> MemberUserIds);
