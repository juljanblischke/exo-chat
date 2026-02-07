using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;

namespace ExoChat.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public abstract class ApiControllerBase : ControllerBase
{
}
