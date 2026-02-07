using MediatR;

namespace ExoChat.Application.Messages.Queries;

public record GetUnreadCountQuery(Guid ConversationId) : IRequest<int>;
