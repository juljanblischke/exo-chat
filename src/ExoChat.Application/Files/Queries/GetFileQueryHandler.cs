using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Files.Queries;

public class GetFileQueryHandler(
    IFileStorageService fileStorageService,
    IRepository<FileAttachment> fileAttachmentRepository) : IRequestHandler<GetFileQuery, FileDownloadDto>
{
    public async Task<FileDownloadDto> Handle(GetFileQuery request, CancellationToken cancellationToken)
    {
        var fileAttachment = await fileAttachmentRepository.GetByIdAsync(request.FileId, cancellationToken)
            ?? throw new NotFoundException(nameof(FileAttachment), request.FileId);

        var stream = await fileStorageService.DownloadFileAsync(fileAttachment.StorageKey, cancellationToken);

        return new FileDownloadDto(stream, fileAttachment.FileName, fileAttachment.ContentType);
    }
}
