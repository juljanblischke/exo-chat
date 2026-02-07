using MediatR;

namespace ExoChat.Application.Conversations.Queries;

public record GetUserStatusQuery(Guid UserId) : IRequest<UserStatusDto>;

public record UserStatusDto(bool IsOnline, DateTime? LastSeenAt);
