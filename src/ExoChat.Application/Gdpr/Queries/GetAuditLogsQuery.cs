using ExoChat.Application.Common.Models;
using ExoChat.Application.Gdpr.DTOs;
using ExoChat.Domain.Enums;
using MediatR;

namespace ExoChat.Application.Gdpr.Queries;

public record GetAuditLogsQuery(
    Guid? UserId = null,
    AuditAction? Action = null,
    DateTime? From = null,
    DateTime? To = null,
    int Page = 1,
    int PageSize = 50) : IRequest<PagedResult<AuditLogDto>>;
