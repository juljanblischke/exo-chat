using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Gdpr.DTOs;
using ExoChat.Domain.Entities;
using ExoChat.Domain.Enums;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Gdpr.Commands;

public class ExportUserDataCommandHandler(
    ICurrentUserService currentUserService,
    IUserRepository userRepository,
    IRepository<DataExportRequest> exportRepository,
    IDataExportService dataExportService,
    IAuditLogService auditLogService,
    IUnitOfWork unitOfWork) : IRequestHandler<ExportUserDataCommand, DataExportDto>
{
    public async Task<DataExportDto> Handle(ExportUserDataCommand request, CancellationToken cancellationToken)
    {
        var keycloakId = currentUserService.UserId
            ?? throw new ForbiddenException("User is not authenticated.");

        var user = await userRepository.GetByKeycloakIdAsync(keycloakId, cancellationToken)
            ?? throw new NotFoundException("User", keycloakId);

        var exportRequest = new DataExportRequest
        {
            UserId = user.Id,
            Status = DataExportStatus.Processing
        };

        await exportRepository.AddAsync(exportRequest, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        try
        {
            var storageKey = await dataExportService.GenerateExportAsync(user.Id, cancellationToken);

            exportRequest.Status = DataExportStatus.Completed;
            exportRequest.CompletedAt = DateTime.UtcNow;
            exportRequest.StorageKey = storageKey;
            exportRequest.ExpiresAt = DateTime.UtcNow.AddHours(24);

            await unitOfWork.SaveChangesAsync(cancellationToken);

            await auditLogService.LogAsync(
                AuditAction.DataExported,
                nameof(DataExportRequest),
                exportRequest.Id.ToString(),
                user.Id,
                cancellationToken: cancellationToken);

            return new DataExportDto(
                exportRequest.Id,
                exportRequest.Status,
                exportRequest.CreatedAt,
                exportRequest.CompletedAt,
                null,
                exportRequest.ExpiresAt);
        }
        catch
        {
            exportRequest.Status = DataExportStatus.Failed;
            await unitOfWork.SaveChangesAsync(cancellationToken);
            throw;
        }
    }
}
