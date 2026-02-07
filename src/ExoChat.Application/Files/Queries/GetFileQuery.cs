using MediatR;

namespace ExoChat.Application.Files.Queries;

public record GetFileQuery(Guid FileId) : IRequest<FileDownloadDto>;
