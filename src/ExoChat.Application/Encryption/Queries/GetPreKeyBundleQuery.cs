using ExoChat.Application.Encryption.DTOs;
using MediatR;

namespace ExoChat.Application.Encryption.Queries;

public record GetPreKeyBundleQuery(Guid UserId) : IRequest<PreKeyBundleDto>;
