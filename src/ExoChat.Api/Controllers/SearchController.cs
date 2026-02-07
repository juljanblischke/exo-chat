using ExoChat.Application.Messages.Queries;
using ExoChat.Shared.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ExoChat.Api.Controllers;

[Route("api/v{version:apiVersion}/messages/search")]
public class SearchController(IMediator mediator) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> SearchMessages(
        [FromQuery(Name = "q")] string searchTerm,
        [FromQuery] Guid? conversationId = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new SearchMessagesQuery(searchTerm, conversationId, from, to, page, pageSize),
            cancellationToken);
        return Ok(ApiResponse<object>.Ok(result));
    }
}
