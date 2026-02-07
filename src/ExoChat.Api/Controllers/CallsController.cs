using ExoChat.Application.Calls.Commands;
using ExoChat.Application.Calls.DTOs;
using ExoChat.Application.Calls.Queries;
using ExoChat.Shared.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ExoChat.Api.Controllers;

[Route("api/v{version:apiVersion}/conversations/{conversationId:guid}/call")]
public class CallsController(IMediator mediator) : ApiControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ApiResponse<CallDto>>> Initiate(
        Guid conversationId, [FromBody] InitiateCallRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new InitiateCallCommand(conversationId, request.IsVideo), cancellationToken);
        return Ok(ApiResponse<CallDto>.Ok(result));
    }

    [HttpPost("join")]
    public async Task<ActionResult<ApiResponse<CallTokenDto>>> Join(
        Guid conversationId, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new JoinCallCommand(conversationId), cancellationToken);
        return Ok(ApiResponse<CallTokenDto>.Ok(result));
    }

    [HttpPost("end")]
    public async Task<ActionResult<ApiResponse>> End(
        Guid conversationId, CancellationToken cancellationToken)
    {
        await mediator.Send(new EndCallCommand(conversationId), cancellationToken);
        return Ok(ApiResponse.Ok());
    }

    [HttpGet("status")]
    public async Task<ActionResult<ApiResponse<CallRoomStatusDto>>> Status(
        Guid conversationId, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetCallStatusQuery(conversationId), cancellationToken);
        return Ok(ApiResponse<CallRoomStatusDto?>.Ok(result));
    }
}

public record InitiateCallRequest(bool IsVideo = true);
