using MediatR;

namespace ExoChat.Application.Messages.Commands;

public record DeleteMessageCommand(Guid ConversationId, Guid MessageId) : IRequest<Unit>;
