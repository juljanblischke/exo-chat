using ExoChat.Application.Users.Commands;
using ExoChat.Application.Users.Queries;
using ExoChat.Domain.Enums;
using ExoChat.Shared.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ExoChat.Api.Controllers;

public class UsersController(IMediator mediator) : ApiControllerBase
{
    [HttpGet("me/profile")]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetProfileQuery(), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpPut("me/profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new UpdateProfileCommand(request.DisplayName, request.AvatarUrl, request.StatusMessage),
            cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpGet("me/privacy")]
    public async Task<IActionResult> GetPrivacySettings(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetPrivacySettingsQuery(), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpPut("me/privacy")]
    public async Task<IActionResult> UpdatePrivacySettings([FromBody] UpdatePrivacySettingsRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new UpdatePrivacySettingsCommand(request.ReadReceiptsEnabled, request.OnlineStatusVisibility),
            cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpGet("me/blocked")]
    public async Task<IActionResult> GetBlockedUsers(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetBlockedUsersQuery(), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpPost("me/blocked/{userId:guid}")]
    public async Task<IActionResult> BlockUser(Guid userId, CancellationToken cancellationToken)
    {
        await mediator.Send(new BlockUserCommand(userId), cancellationToken);
        return Ok(ApiResponse.Ok());
    }

    [HttpDelete("me/blocked/{userId:guid}")]
    public async Task<IActionResult> UnblockUser(Guid userId, CancellationToken cancellationToken)
    {
        await mediator.Send(new UnblockUserCommand(userId), cancellationToken);
        return Ok(ApiResponse.Ok());
    }
}

public record UpdateProfileRequest(string? DisplayName, string? AvatarUrl, string? StatusMessage);
public record UpdatePrivacySettingsRequest(bool ReadReceiptsEnabled, StatusVisibility OnlineStatusVisibility);
