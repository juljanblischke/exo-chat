using MediatR;

namespace ExoChat.Application.Users.Commands;

public record BlockUserCommand(Guid BlockedUserId) : IRequest;
