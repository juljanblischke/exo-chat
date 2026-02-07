using ExoChat.Application.Calls.DTOs;
using MediatR;

namespace ExoChat.Application.Calls.Commands;

public record InitiateCallCommand(
    Guid ConversationId,
    bool IsVideo) : IRequest<CallDto>;
