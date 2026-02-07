using System.Security.Claims;
using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities;
using ExoChat.Infrastructure.Persistence.Repositories;

namespace ExoChat.Api.Middleware;

public class UserSyncMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var keycloakId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(keycloakId))
            {
                var existingUser = await userRepository.GetByKeycloakIdAsync(keycloakId);
                if (existingUser is null)
                {
                    var displayName = context.User.FindFirstValue("preferred_username")
                                      ?? context.User.FindFirstValue(ClaimTypes.Name)
                                      ?? "Unknown";

                    var user = new User
                    {
                        KeycloakId = keycloakId,
                        DisplayName = displayName
                    };

                    await userRepository.AddAsync(user);
                    await unitOfWork.SaveChangesAsync();
                }
            }
        }

        await next(context);
    }
}
