using MediatR;

namespace ExoChat.Application.Users.Commands;

public record UnblockUserCommand(Guid BlockedUserId) : IRequest;
