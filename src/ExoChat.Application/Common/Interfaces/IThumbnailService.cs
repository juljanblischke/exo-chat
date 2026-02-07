namespace ExoChat.Application.Common.Interfaces;

public interface IThumbnailService
{
    Task<Stream?> GenerateThumbnailAsync(Stream imageStream, int maxWidth = 300, int maxHeight = 300, CancellationToken cancellationToken = default);
    bool CanGenerateThumbnail(string contentType);
}
