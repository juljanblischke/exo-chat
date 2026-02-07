using ExoChat.Application.Conversations.DTOs;
using MediatR;

namespace ExoChat.Application.Groups.Queries;

public record GetGroupParticipantsQuery(Guid ConversationId) : IRequest<IReadOnlyList<ParticipantDto>>;
