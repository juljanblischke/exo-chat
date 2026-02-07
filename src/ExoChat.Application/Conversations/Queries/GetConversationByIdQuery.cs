using ExoChat.Application.Conversations.DTOs;
using MediatR;

namespace ExoChat.Application.Conversations.Queries;

public record GetConversationByIdQuery(Guid Id) : IRequest<ConversationDto>;
