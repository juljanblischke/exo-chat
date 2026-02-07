using ExoChat.Application.Messages.Commands;
using ExoChat.Application.Messages.Queries;
using ExoChat.Domain.Enums;
using ExoChat.Shared.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ExoChat.Api.Controllers;

[Route("api/v{version:apiVersion}/conversations/{conversationId:guid}/messages")]
public class MessagesController(IMediator mediator) : ApiControllerBase
{
    [HttpPost]
    public async Task<IActionResult> SendMessage(Guid conversationId, [FromBody] SendMessageRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new SendMessageCommand(conversationId, request.Content, request.MessageType), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpGet]
    public async Task<IActionResult> GetMessages(Guid conversationId, [FromQuery] string? cursor = null, [FromQuery] int limit = 50, CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new GetMessagesQuery(conversationId, cursor, limit), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpPut("{messageId:guid}")]
    public async Task<IActionResult> EditMessage(Guid conversationId, Guid messageId, [FromBody] EditMessageRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new EditMessageCommand(conversationId, messageId, request.Content), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpDelete("{messageId:guid}")]
    public async Task<IActionResult> DeleteMessage(Guid conversationId, Guid messageId, CancellationToken cancellationToken)
    {
        await mediator.Send(new DeleteMessageCommand(conversationId, messageId), cancellationToken);
        return Ok(ApiResponse.Ok());
    }
}

public record SendMessageRequest(string Content, MessageType MessageType = MessageType.Text);
public record EditMessageRequest(string Content);
