namespace ExoChat.Application.Files;

public record FileUploadResultDto(
    string FileId,
    string FileName,
    string ContentType,
    long Size,
    string Url,
    string? ThumbnailUrl);
