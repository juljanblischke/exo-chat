using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ExoChat.Application.Gdpr.Commands;

public class CleanupExpiredMessagesCommandHandler(
    IRepository<Message> messageRepository,
    IUnitOfWork unitOfWork,
    IConfiguration configuration,
    ILogger<CleanupExpiredMessagesCommandHandler> logger) : IRequestHandler<CleanupExpiredMessagesCommand, int>
{
    public async Task<int> Handle(CleanupExpiredMessagesCommand request, CancellationToken cancellationToken)
    {
        var retentionDaysValue = configuration.GetSection("Retention:MessageRetentionDays").Value;
        var retentionDays = int.TryParse(retentionDaysValue, out var parsed) ? parsed : 0;
        if (retentionDays <= 0)
        {
            logger.LogDebug("Message retention is disabled (RetentionDays = {Days})", retentionDays);
            return 0;
        }

        var cutoffDate = DateTime.UtcNow.AddDays(-retentionDays);

        var expiredMessages = await messageRepository.Query()
            .IgnoreQueryFilters()
            .Where(m => m.CreatedAt < cutoffDate)
            .ToListAsync(cancellationToken);

        foreach (var message in expiredMessages)
        {
            messageRepository.Delete(message);
        }

        if (expiredMessages.Count > 0)
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Cleaned up {Count} expired messages older than {Days} days",
                expiredMessages.Count, retentionDays);
        }

        return expiredMessages.Count;
    }
}
