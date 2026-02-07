namespace ExoChat.Application.Files;

public record FileDownloadDto(
    Stream Content,
    string FileName,
    string ContentType);
