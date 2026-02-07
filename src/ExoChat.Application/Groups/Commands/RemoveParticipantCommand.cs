using MediatR;

namespace ExoChat.Application.Groups.Commands;

public record RemoveParticipantCommand(Guid ConversationId, Guid UserId) : IRequest<Unit>;
