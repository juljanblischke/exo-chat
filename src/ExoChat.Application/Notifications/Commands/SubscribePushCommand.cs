using MediatR;

namespace ExoChat.Application.Notifications.Commands;

public record SubscribePushCommand(
    string Endpoint,
    string P256dhKey,
    string AuthKey,
    string? UserAgent = null) : IRequest;
