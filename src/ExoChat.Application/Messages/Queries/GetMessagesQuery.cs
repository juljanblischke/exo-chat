using ExoChat.Application.Common.Models;
using ExoChat.Application.Messages.DTOs;
using MediatR;

namespace ExoChat.Application.Messages.Queries;

public record GetMessagesQuery(
    Guid ConversationId,
    string? Cursor = null,
    int Limit = 50) : IRequest<CursorPagedResult<MessageDto>>;
