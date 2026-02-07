using ExoChat.Application.Gdpr.Commands;
using ExoChat.Application.Gdpr.Queries;
using ExoChat.Shared.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ExoChat.Api.Controllers;

[Route("api/v{version:apiVersion}/users/me")]
public class GdprController(IMediator mediator) : ApiControllerBase
{
    [HttpGet("export")]
    public async Task<IActionResult> RequestExportAsync(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ExportUserDataCommand(), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpGet("export/{id:guid}/download")]
    public async Task<IActionResult> GetExportDownloadAsync(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetDataExportQuery(id), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpDelete]
    public async Task<IActionResult> RequestAccountDeletionAsync([FromBody] AccountDeletionRequest? request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new RequestAccountDeletionCommand(request?.Reason), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpPost("cancel-deletion")]
    public async Task<IActionResult> CancelAccountDeletionAsync(CancellationToken cancellationToken)
    {
        await mediator.Send(new CancelAccountDeletionCommand(), cancellationToken);
        return Ok(ApiResponse.Ok());
    }

    [HttpGet("consents")]
    public async Task<IActionResult> GetConsentsAsync(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetUserConsentsQuery(), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpPut("consents")]
    public async Task<IActionResult> UpdateConsentAsync([FromBody] UpdateConsentRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new UpdateConsentCommand(request.ConsentType, request.IsGranted), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }
}

public record AccountDeletionRequest(string? Reason = null);
public record UpdateConsentRequest(ExoChat.Domain.Enums.ConsentType ConsentType, bool IsGranted);
