using ExoChat.Application.Common.Interfaces;
using ExoChat.Infrastructure.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;

namespace ExoChat.Infrastructure.Services;

public class MinioFileStorageService : IFileStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly MinioOptions _options;
    private readonly ILogger<MinioFileStorageService> _logger;

    public MinioFileStorageService(IOptions<MinioOptions> options, ILogger<MinioFileStorageService> logger)
    {
        _options = options.Value;
        _logger = logger;
        _minioClient = new MinioClient()
            .WithEndpoint(_options.Endpoint)
            .WithCredentials(_options.AccessKey, _options.SecretKey)
            .WithSSL(_options.UseSSL)
            .Build();
    }

    public async Task EnsureBucketExistsAsync(CancellationToken cancellationToken = default)
    {
        var buckets = new[] { _options.BucketName };

        foreach (var bucket in buckets)
        {
            var exists = await _minioClient.BucketExistsAsync(
                new BucketExistsArgs().WithBucket(bucket), cancellationToken);

            if (!exists)
            {
                await _minioClient.MakeBucketAsync(
                    new MakeBucketArgs().WithBucket(bucket), cancellationToken);
                _logger.LogInformation("Created MinIO bucket: {Bucket}", bucket);
            }
        }
    }

    public async Task<string> UploadFileAsync(Stream stream, string fileName, string contentType,
        CancellationToken cancellationToken = default)
    {
        var storageKey = GenerateStorageKey(fileName);

        await _minioClient.PutObjectAsync(new PutObjectArgs()
            .WithBucket(_options.BucketName)
            .WithObject(storageKey)
            .WithStreamData(stream)
            .WithObjectSize(stream.Length)
            .WithContentType(contentType), cancellationToken);

        _logger.LogInformation("Uploaded file {FileName} as {StorageKey}", fileName, storageKey);
        return storageKey;
    }

    public async Task<string> GeneratePresignedUrlAsync(string storageKey, int expiryMinutes = 60,
        CancellationToken cancellationToken = default)
    {
        var url = await _minioClient.PresignedGetObjectAsync(new PresignedGetObjectArgs()
            .WithBucket(_options.BucketName)
            .WithObject(storageKey)
            .WithExpiry(expiryMinutes * 60));

        return url;
    }

    public async Task DeleteFileAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        await _minioClient.RemoveObjectAsync(new RemoveObjectArgs()
            .WithBucket(_options.BucketName)
            .WithObject(storageKey), cancellationToken);

        _logger.LogInformation("Deleted file {StorageKey}", storageKey);
    }

    public async Task<Stream> DownloadFileAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        var memoryStream = new MemoryStream();

        await _minioClient.GetObjectAsync(new GetObjectArgs()
            .WithBucket(_options.BucketName)
            .WithObject(storageKey)
            .WithCallbackStream(stream => stream.CopyTo(memoryStream)), cancellationToken);

        memoryStream.Position = 0;
        return memoryStream;
    }

    private static string GenerateStorageKey(string fileName)
    {
        var now = DateTime.UtcNow;
        return $"{now:yyyy}/{now:MM}/{now:dd}/{Guid.NewGuid()}_{fileName}";
    }
}
