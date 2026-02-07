using ExoChat.Application.Groups.DTOs;
using MediatR;

namespace ExoChat.Application.Groups.Commands;

public record UpdateGroupCommand(
    Guid ConversationId,
    string Name,
    string? Description,
    string? AvatarUrl) : IRequest<GroupDto>;
