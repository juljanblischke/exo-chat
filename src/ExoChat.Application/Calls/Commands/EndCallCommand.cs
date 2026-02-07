using MediatR;

namespace ExoChat.Application.Calls.Commands;

public record EndCallCommand(Guid ConversationId) : IRequest;
