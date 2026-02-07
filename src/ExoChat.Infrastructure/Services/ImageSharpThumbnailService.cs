using ExoChat.Application.Common.Interfaces;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Processing;

namespace ExoChat.Infrastructure.Services;

public class ImageSharpThumbnailService : IThumbnailService
{
    private static readonly HashSet<string> SupportedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
    };

    public bool CanGenerateThumbnail(string contentType)
    {
        return SupportedContentTypes.Contains(contentType);
    }

    public async Task<Stream?> GenerateThumbnailAsync(Stream imageStream, int maxWidth = 300, int maxHeight = 300,
        CancellationToken cancellationToken = default)
    {
        try
        {
            using var image = await Image.LoadAsync(imageStream, cancellationToken);

            image.Mutate(x => x.Resize(new ResizeOptions
            {
                Mode = ResizeMode.Max,
                Size = new Size(maxWidth, maxHeight)
            }));

            var outputStream = new MemoryStream();
            await image.SaveAsync(outputStream, new PngEncoder(), cancellationToken);
            outputStream.Position = 0;
            return outputStream;
        }
        catch
        {
            return null;
        }
    }
}
