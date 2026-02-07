using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Gdpr.DTOs;
using ExoChat.Domain.Entities;
using ExoChat.Domain.Enums;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Gdpr.Queries;

public class GetDataExportQueryHandler(
    ICurrentUserService currentUserService,
    IUserRepository userRepository,
    IRepository<DataExportRequest> exportRepository,
    IFileStorageService fileStorageService) : IRequestHandler<GetDataExportQuery, DataExportDto>
{
    public async Task<DataExportDto> Handle(GetDataExportQuery request, CancellationToken cancellationToken)
    {
        var keycloakId = currentUserService.UserId
            ?? throw new ForbiddenException("User is not authenticated.");

        var user = await userRepository.GetByKeycloakIdAsync(keycloakId, cancellationToken)
            ?? throw new NotFoundException("User", keycloakId);

        var export = await exportRepository.GetByIdAsync(request.ExportId, cancellationToken)
            ?? throw new NotFoundException(nameof(DataExportRequest), request.ExportId.ToString());

        if (export.UserId != user.Id)
            throw new ForbiddenException("You do not have access to this export.");

        string? downloadUrl = null;
        if (export.Status == DataExportStatus.Completed
            && export.StorageKey is not null
            && export.ExpiresAt > DateTime.UtcNow)
        {
            downloadUrl = await fileStorageService.GeneratePresignedUrlAsync(
                export.StorageKey, 60, cancellationToken);
        }

        return new DataExportDto(
            export.Id,
            export.Status,
            export.CreatedAt,
            export.CompletedAt,
            downloadUrl,
            export.ExpiresAt);
    }
}
