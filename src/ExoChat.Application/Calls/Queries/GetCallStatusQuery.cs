using ExoChat.Application.Calls.DTOs;
using MediatR;

namespace ExoChat.Application.Calls.Queries;

public record GetCallStatusQuery(Guid ConversationId) : IRequest<CallRoomStatusDto?>;
