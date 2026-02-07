using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Common.Models;
using ExoChat.Application.Gdpr.DTOs;
using ExoChat.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Application.Gdpr.Queries;

public class GetAuditLogsQueryHandler(
    IRepository<AuditLogEntry> auditLogRepository) : IRequestHandler<GetAuditLogsQuery, PagedResult<AuditLogDto>>
{
    public async Task<PagedResult<AuditLogDto>> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        var query = auditLogRepository.Query();

        if (request.UserId.HasValue)
            query = query.Where(a => a.UserId == request.UserId.Value);

        if (request.Action.HasValue)
            query = query.Where(a => a.Action == request.Action.Value);

        if (request.From.HasValue)
            query = query.Where(a => a.CreatedAt >= request.From.Value);

        if (request.To.HasValue)
            query = query.Where(a => a.CreatedAt <= request.To.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(a => new AuditLogDto(
                a.Id,
                a.UserId,
                a.Action,
                a.EntityType,
                a.EntityId,
                a.IpAddress,
                a.CreatedAt,
                a.Details))
            .ToListAsync(cancellationToken);

        return new PagedResult<AuditLogDto>(items, totalCount, request.Page, request.PageSize);
    }
}
