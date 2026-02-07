using ExoChat.Application.Calls.DTOs;
using MediatR;

namespace ExoChat.Application.Calls.Commands;

public record JoinCallCommand(Guid ConversationId) : IRequest<CallTokenDto>;
