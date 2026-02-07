namespace ExoChat.Infrastructure.Options;

public class MinioOptions
{
    public const string SectionName = "MinIO";

    public string Endpoint { get; set; } = "localhost:9000";
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string BucketName { get; set; } = "exochat-files";
    public bool UseSSL { get; set; }
}
