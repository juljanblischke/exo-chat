using MediatR;

namespace ExoChat.Application.Files.Commands;

public record UploadFileCommand(
    Stream FileStream,
    string FileName,
    string ContentType,
    long Size,
    Guid? MessageId) : IRequest<FileUploadResultDto>;
