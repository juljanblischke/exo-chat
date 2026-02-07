using MediatR;

namespace ExoChat.Application.Files.Queries;

public record GetFilePresignedUrlQuery(Guid FileId, bool Thumbnail = false) : IRequest<string>;
