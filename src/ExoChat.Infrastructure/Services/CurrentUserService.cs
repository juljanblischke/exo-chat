using System.Security.Claims;
using ExoChat.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace ExoChat.Infrastructure.Services;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public string? UserId => httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);

    public string? DisplayName => httpContextAccessor.HttpContext?.User.FindFirstValue("preferred_username")
                                  ?? httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name);

    public string? Email => httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email);

    public IReadOnlyList<string> Roles => httpContextAccessor.HttpContext?.User
        .FindAll(ClaimTypes.Role)
        .Select(c => c.Value)
        .ToList()
        .AsReadOnly() ?? (IReadOnlyList<string>)Array.Empty<string>();

    public bool IsAuthenticated => httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;
}
