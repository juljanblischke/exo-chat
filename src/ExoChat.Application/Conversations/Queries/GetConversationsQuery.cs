using ExoChat.Application.Common.Models;
using ExoChat.Application.Conversations.DTOs;
using MediatR;

namespace ExoChat.Application.Conversations.Queries;

public record GetConversationsQuery(int Page = 1, int PageSize = 20) : IRequest<PagedResult<ConversationListItemDto>>;
