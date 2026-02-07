using ExoChat.Application.Encryption.DTOs;
using MediatR;

namespace ExoChat.Application.Encryption.Queries;

public record GetOneTimePreKeyCountQuery() : IRequest<KeyCountDto>;
