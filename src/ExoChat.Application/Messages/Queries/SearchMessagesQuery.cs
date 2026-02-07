using ExoChat.Application.Common.Models;
using ExoChat.Application.Messages.DTOs;
using MediatR;

namespace ExoChat.Application.Messages.Queries;

public record SearchMessagesQuery(
    string SearchTerm,
    Guid? ConversationId = null,
    DateTime? DateFrom = null,
    DateTime? DateTo = null,
    int PageNumber = 1,
    int PageSize = 20) : IRequest<PagedResult<SearchResultDto>>;
