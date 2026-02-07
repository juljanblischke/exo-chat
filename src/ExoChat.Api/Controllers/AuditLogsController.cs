using ExoChat.Application.Gdpr.Queries;
using ExoChat.Domain.Enums;
using ExoChat.Shared.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExoChat.Api.Controllers;

[Route("api/v{version:apiVersion}/admin/audit-logs")]
[Authorize(Roles = "admin")]
public class AuditLogsController(IMediator mediator) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAuditLogsAsync(
        [FromQuery] Guid? userId,
        [FromQuery] AuditAction? action,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new GetAuditLogsQuery(userId, action, from, to, page, pageSize), cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }
}
