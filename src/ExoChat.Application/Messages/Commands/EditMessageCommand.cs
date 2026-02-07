using ExoChat.Application.Messages.DTOs;
using MediatR;

namespace ExoChat.Application.Messages.Commands;

public record EditMessageCommand(
    Guid ConversationId,
    Guid MessageId,
    string Content) : IRequest<MessageDto>;
