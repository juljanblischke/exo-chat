using MediatR;

namespace ExoChat.Application.Messages.Commands;

public record MarkMessagesAsReadCommand(Guid ConversationId, Guid? UpToMessageId = null) : IRequest<int>;
