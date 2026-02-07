using ExoChat.Application.Encryption.Commands;
using ExoChat.Application.Encryption.DTOs;
using ExoChat.Application.Encryption.Queries;
using ExoChat.Shared.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ExoChat.Api.Controllers;

[Route("api/v{version:apiVersion}/encryption")]
public class EncryptionController(IMediator mediator) : ApiControllerBase
{
    [HttpPost("keys")]
    public async Task<IActionResult> UploadPreKeys([FromBody] KeyUploadDto keys, CancellationToken cancellationToken)
    {
        await mediator.Send(new UploadPreKeysCommand(keys), cancellationToken);
        return Ok(ApiResponse.Ok());
    }

    [HttpGet("keys/{userId:guid}/bundle")]
    public async Task<IActionResult> GetPreKeyBundle(Guid userId, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetPreKeyBundleQuery(userId), cancellationToken);
        return Ok(ApiResponse<PreKeyBundleDto>.Ok(result));
    }

    [HttpPost("keys/rotate")]
    public async Task<IActionResult> RotateSignedPreKey([FromBody] SignedPreKeyUploadDto signedPreKey, CancellationToken cancellationToken)
    {
        await mediator.Send(new RotateSignedPreKeyCommand(signedPreKey), cancellationToken);
        return Ok(ApiResponse.Ok());
    }

    [HttpGet("keys/count")]
    public async Task<IActionResult> GetOneTimePreKeyCount(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetOneTimePreKeyCountQuery(), cancellationToken);
        return Ok(ApiResponse<KeyCountDto>.Ok(result));
    }
}
