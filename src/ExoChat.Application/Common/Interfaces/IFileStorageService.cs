namespace ExoChat.Application.Common.Interfaces;

public interface IFileStorageService
{
    Task<string> UploadFileAsync(Stream stream, string fileName, string contentType, CancellationToken cancellationToken = default);
    Task<string> GeneratePresignedUrlAsync(string storageKey, int expiryMinutes = 60, CancellationToken cancellationToken = default);
    Task DeleteFileAsync(string storageKey, CancellationToken cancellationToken = default);
    Task<Stream> DownloadFileAsync(string storageKey, CancellationToken cancellationToken = default);
}
