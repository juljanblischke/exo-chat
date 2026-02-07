using MediatR;

namespace ExoChat.Application.Notifications.Commands;

public record UnsubscribePushCommand(string Endpoint) : IRequest;
