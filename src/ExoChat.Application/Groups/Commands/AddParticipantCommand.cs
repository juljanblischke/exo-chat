using ExoChat.Application.Conversations.DTOs;
using MediatR;

namespace ExoChat.Application.Groups.Commands;

public record AddParticipantCommand(Guid ConversationId, Guid UserId) : IRequest<ParticipantDto>;
