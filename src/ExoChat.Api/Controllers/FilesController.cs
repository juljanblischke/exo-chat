using ExoChat.Application.Files;
using ExoChat.Application.Files.Commands;
using ExoChat.Application.Files.Queries;
using ExoChat.Shared.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ExoChat.Api.Controllers;

public class FilesController(IMediator mediator) : ApiControllerBase
{
    [HttpPost("upload")]
    [RequestSizeLimit(52_428_800)] // 50 MB
    public async Task<ActionResult<ApiResponse<FileUploadResultDto>>> Upload(
        IFormFile file, [FromForm] Guid? messageId, CancellationToken cancellationToken)
    {
        await using var stream = file.OpenReadStream();

        var command = new UploadFileCommand(
            stream,
            file.FileName,
            file.ContentType,
            file.Length,
            messageId);

        var result = await mediator.Send(command, cancellationToken);
        return Ok(ApiResponse<FileUploadResultDto>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Download(Guid id, CancellationToken cancellationToken)
    {
        var url = await mediator.Send(new GetFilePresignedUrlQuery(id), cancellationToken);
        return Redirect(url);
    }

    [HttpGet("{id:guid}/thumbnail")]
    public async Task<IActionResult> Thumbnail(Guid id, CancellationToken cancellationToken)
    {
        var url = await mediator.Send(new GetFilePresignedUrlQuery(id, Thumbnail: true), cancellationToken);
        return Redirect(url);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id, CancellationToken cancellationToken)
    {
        await mediator.Send(new DeleteFileCommand(id), cancellationToken);
        return Ok(ApiResponse.Ok());
    }
}
