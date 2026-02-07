using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Files.Queries;

public class GetFilePresignedUrlQueryHandler(
    IFileStorageService fileStorageService,
    IRepository<FileAttachment> fileAttachmentRepository) : IRequestHandler<GetFilePresignedUrlQuery, string>
{
    public async Task<string> Handle(GetFilePresignedUrlQuery request, CancellationToken cancellationToken)
    {
        var fileAttachment = await fileAttachmentRepository.GetByIdAsync(request.FileId, cancellationToken)
            ?? throw new NotFoundException(nameof(FileAttachment), request.FileId);

        var storageKey = request.Thumbnail
            ? fileAttachment.ThumbnailKey ?? throw new NotFoundException("Thumbnail", request.FileId)
            : fileAttachment.StorageKey;

        return await fileStorageService.GeneratePresignedUrlAsync(storageKey, cancellationToken: cancellationToken);
    }
}
