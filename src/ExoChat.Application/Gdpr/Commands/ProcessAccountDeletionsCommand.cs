using MediatR;

namespace ExoChat.Application.Gdpr.Commands;

public record ProcessAccountDeletionsCommand : IRequest<int>;
