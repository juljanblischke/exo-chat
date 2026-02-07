using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ExoChat.Infrastructure.Services;

public class MinioBucketInitializer(
    IServiceProvider serviceProvider,
    ILogger<MinioBucketInitializer> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = serviceProvider.CreateScope();
            var fileStorageService = scope.ServiceProvider.GetRequiredService<MinioFileStorageService>();
            await fileStorageService.EnsureBucketExistsAsync(cancellationToken);
            logger.LogInformation("MinIO bucket initialization completed");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to initialize MinIO buckets. They will be created on first use");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
