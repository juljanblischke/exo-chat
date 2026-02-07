using MediatR;

namespace ExoChat.Application.Encryption.Queries;

public record GetIdentityKeyQuery(Guid UserId) : IRequest<string>;
