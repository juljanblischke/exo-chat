using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Files.Commands;

public class DeleteFileCommandHandler(
    IFileStorageService fileStorageService,
    IRepository<FileAttachment> fileAttachmentRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<DeleteFileCommand>
{
    public async Task Handle(DeleteFileCommand request, CancellationToken cancellationToken)
    {
        var fileAttachment = await fileAttachmentRepository.GetByIdAsync(request.FileId, cancellationToken)
            ?? throw new NotFoundException(nameof(FileAttachment), request.FileId);

        await fileStorageService.DeleteFileAsync(fileAttachment.StorageKey, cancellationToken);

        if (fileAttachment.ThumbnailKey is not null)
        {
            await fileStorageService.DeleteFileAsync(fileAttachment.ThumbnailKey, cancellationToken);
        }

        fileAttachmentRepository.Delete(fileAttachment);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
