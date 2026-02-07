using ExoChat.Application.Messages.DTOs;
using ExoChat.Domain.Enums;
using MediatR;

namespace ExoChat.Application.Messages.Commands;

public record SendMessageCommand(
    Guid ConversationId,
    string Content,
    MessageType MessageType = MessageType.Text) : IRequest<MessageDto>;
