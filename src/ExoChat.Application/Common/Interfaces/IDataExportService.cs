namespace ExoChat.Application.Common.Interfaces;

public interface IDataExportService
{
    Task<string> GenerateExportAsync(Guid userId, CancellationToken cancellationToken = default);
}
