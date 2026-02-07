using ExoChat.Application.Users.DTOs;
using MediatR;

namespace ExoChat.Application.Users.Queries;

public record GetBlockedUsersQuery : IRequest<IReadOnlyList<BlockedUserDto>>;
