using ExoChat.Application.Conversations.DTOs;
using MediatR;

namespace ExoChat.Application.Conversations.Commands;

public record CreateGroupConversationCommand(
    string Name,
    string? Description,
    List<Guid> MemberUserIds) : IRequest<ConversationDto>;
