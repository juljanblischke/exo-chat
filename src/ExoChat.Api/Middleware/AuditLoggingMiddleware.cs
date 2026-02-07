using System.Security.Claims;
using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Enums;

namespace ExoChat.Api.Middleware;

public class AuditLoggingMiddleware(RequestDelegate next)
{
    private static readonly HashSet<string> AuditedPaths = new(StringComparer.OrdinalIgnoreCase)
    {
        "/api/v1/users/me/export",
        "/api/v1/users/me/consents",
    };

    public async Task InvokeAsync(HttpContext context, IAuditLogService auditLogService)
    {
        await next(context);

        if (!context.User.Identity?.IsAuthenticated ?? true)
            return;

        var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
        var method = context.Request.Method;

        if (!ShouldAudit(path, method))
            return;

        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? context.User.FindFirst("sub")?.Value;

        Guid? userGuid = userId is not null && Guid.TryParse(userId, out var parsed) ? parsed : null;

        var ipAddress = context.Connection.RemoteIpAddress?.ToString();
        var userAgent = context.Request.Headers.UserAgent.ToString();

        var action = DetermineAction(path, method);
        if (action is null)
            return;

        await auditLogService.LogAsync(
            action.Value,
            "HttpRequest",
            entityId: path,
            userId: userGuid,
            ipAddress: ipAddress,
            userAgent: userAgent,
            details: $"{method} {path} -> {context.Response.StatusCode}");
    }

    private static bool ShouldAudit(string path, string method)
    {
        if (method == "DELETE" && path.StartsWith("/api/v1/users/me"))
            return true;

        foreach (var auditedPath in AuditedPaths)
        {
            if (path.StartsWith(auditedPath))
                return true;
        }

        return false;
    }

    private static AuditAction? DetermineAction(string path, string method)
    {
        if (path.Contains("/export") && method == "GET")
            return AuditAction.DataExported;

        if (path.Contains("/consents") && method == "PUT")
            return AuditAction.ConsentUpdated;

        if (method == "DELETE" && path.StartsWith("/api/v1/users/me"))
            return AuditAction.AccountDeletionRequested;

        return null;
    }
}
