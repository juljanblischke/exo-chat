using ExoChat.Application.Conversations.DTOs;
using MediatR;

namespace ExoChat.Application.Conversations.Commands;

public record CreateDirectConversationCommand(Guid OtherUserId) : IRequest<ConversationDto>;
