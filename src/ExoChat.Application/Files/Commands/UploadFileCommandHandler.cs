using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities;
using MediatR;

namespace ExoChat.Application.Files.Commands;

public class UploadFileCommandHandler(
    IFileStorageService fileStorageService,
    IThumbnailService thumbnailService,
    IRepository<FileAttachment> fileAttachmentRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<UploadFileCommand, FileUploadResultDto>
{
    public async Task<FileUploadResultDto> Handle(UploadFileCommand request, CancellationToken cancellationToken)
    {
        var storageKey = await fileStorageService.UploadFileAsync(
            request.FileStream, request.FileName, request.ContentType, cancellationToken);

        string? thumbnailKey = null;
        if (thumbnailService.CanGenerateThumbnail(request.ContentType))
        {
            request.FileStream.Position = 0;
            using var thumbnailStream = await thumbnailService.GenerateThumbnailAsync(
                request.FileStream, cancellationToken: cancellationToken);

            if (thumbnailStream is not null)
            {
                var thumbFileName = $"thumb_{request.FileName}";
                thumbnailKey = await fileStorageService.UploadFileAsync(
                    thumbnailStream, thumbFileName, "image/png", cancellationToken);
            }
        }

        var fileAttachment = new FileAttachment
        {
            MessageId = request.MessageId ?? Guid.Empty,
            FileName = request.FileName,
            ContentType = request.ContentType,
            Size = request.Size,
            StorageKey = storageKey,
            ThumbnailKey = thumbnailKey
        };

        await fileAttachmentRepository.AddAsync(fileAttachment, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var url = await fileStorageService.GeneratePresignedUrlAsync(storageKey, cancellationToken: cancellationToken);
        string? thumbnailUrl = thumbnailKey is not null
            ? await fileStorageService.GeneratePresignedUrlAsync(thumbnailKey, cancellationToken: cancellationToken)
            : null;

        return new FileUploadResultDto(
            fileAttachment.Id.ToString(),
            fileAttachment.FileName,
            fileAttachment.ContentType,
            fileAttachment.Size,
            url,
            thumbnailUrl);
    }
}
