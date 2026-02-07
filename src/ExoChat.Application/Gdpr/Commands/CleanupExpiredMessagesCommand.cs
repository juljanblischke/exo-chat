using MediatR;

namespace ExoChat.Application.Gdpr.Commands;

public record CleanupExpiredMessagesCommand : IRequest<int>;
