using ExoChat.Domain.Enums;
using MediatR;

namespace ExoChat.Application.Groups.Commands;

public record UpdateParticipantRoleCommand(Guid ConversationId, Guid UserId, ParticipantRole NewRole) : IRequest<Unit>;
