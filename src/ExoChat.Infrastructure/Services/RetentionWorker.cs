using ExoChat.Application.Gdpr.Commands;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ExoChat.Infrastructure.Services;

public class RetentionWorker(
    IServiceScopeFactory scopeFactory,
    ILogger<RetentionWorker> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(6);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("RetentionWorker started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

                var deletedMessages = await mediator.Send(new CleanupExpiredMessagesCommand(), stoppingToken);
                if (deletedMessages > 0)
                    logger.LogInformation("RetentionWorker cleaned up {Count} expired messages", deletedMessages);

                var deletedAccounts = await mediator.Send(new ProcessAccountDeletionsCommand(), stoppingToken);
                if (deletedAccounts > 0)
                    logger.LogInformation("RetentionWorker processed {Count} account deletions", deletedAccounts);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "RetentionWorker encountered an error");
            }

            await Task.Delay(Interval, stoppingToken);
        }
    }
}
