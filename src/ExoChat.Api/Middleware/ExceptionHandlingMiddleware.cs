using System.Net;
using System.Text.Json;
using ExoChat.Shared.Exceptions;
using ExoChat.Shared.Models;

namespace ExoChat.Api.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, response) = exception switch
        {
            Shared.Exceptions.ValidationException validationEx => (
                HttpStatusCode.BadRequest,
                new ApiResponse<object> { Success = false, Errors = new List<string> { validationEx.Message }, ValidationErrors = new Dictionary<string, string[]>(validationEx.Errors) }
            ),
            NotFoundException => (HttpStatusCode.NotFound, ApiResponse.Fail(exception.Message)),
            ForbiddenException => (HttpStatusCode.Forbidden, ApiResponse.Fail(exception.Message)),
            ConflictException => (HttpStatusCode.Conflict, ApiResponse.Fail(exception.Message)),
            ExoChatException => (HttpStatusCode.BadRequest, ApiResponse.Fail(exception.Message)),
            _ => (HttpStatusCode.InternalServerError, ApiResponse.Fail("An unexpected error occurred."))
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        await context.Response.WriteAsync(json);
    }
}
