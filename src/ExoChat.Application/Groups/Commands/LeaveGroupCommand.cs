using MediatR;

namespace ExoChat.Application.Groups.Commands;

public record LeaveGroupCommand(Guid ConversationId) : IRequest<Unit>;
