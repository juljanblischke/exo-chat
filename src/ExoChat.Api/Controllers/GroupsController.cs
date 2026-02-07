using ExoChat.Application.Groups.Commands;
using ExoChat.Application.Groups.Queries;
using ExoChat.Domain.Enums;
using ExoChat.Shared.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ExoChat.Api.Controllers;

[Route("api/v{version:apiVersion}/groups/{conversationId:guid}")]
public class GroupsController(IMediator mediator) : ApiControllerBase
{
    [HttpPut]
    public async Task<IActionResult> UpdateGroup(Guid conversationId, [FromBody] UpdateGroupRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new UpdateGroupCommand(conversationId, request.Name, request.Description, request.AvatarUrl), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpGet("members")]
    public async Task<IActionResult> GetMembers(Guid conversationId, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetGroupParticipantsQuery(conversationId), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpPost("members")]
    public async Task<IActionResult> AddMember(Guid conversationId, [FromBody] AddMemberRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new AddParticipantCommand(conversationId, request.UserId), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpDelete("members/{userId:guid}")]
    public async Task<IActionResult> RemoveMember(Guid conversationId, Guid userId, CancellationToken cancellationToken)
    {
        await mediator.Send(new RemoveParticipantCommand(conversationId, userId), cancellationToken);
        return Ok(ApiResponse.Ok());
    }

    [HttpPut("members/{userId:guid}/role")]
    public async Task<IActionResult> ChangeRole(Guid conversationId, Guid userId, [FromBody] ChangeRoleRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new UpdateParticipantRoleCommand(conversationId, userId, request.Role), cancellationToken);
        return Ok(ApiResponse.Ok());
    }

    [HttpPost("leave")]
    public async Task<IActionResult> LeaveGroup(Guid conversationId, CancellationToken cancellationToken)
    {
        await mediator.Send(new LeaveGroupCommand(conversationId), cancellationToken);
        return Ok(ApiResponse.Ok());
    }
}

public record UpdateGroupRequest(string Name, string? Description, string? AvatarUrl);
public record AddMemberRequest(Guid UserId);
public record ChangeRoleRequest(ParticipantRole Role);
