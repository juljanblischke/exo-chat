using ExoChat.Application.Calls.DTOs;
using ExoChat.Application.Common.Interfaces;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Calls.Commands;

public class InitiateCallCommandHandler(
    ICallService callService,
    IConversationRepository conversationRepository,
    IParticipantRepository participantRepository,
    ICurrentUserService currentUserService) : IRequestHandler<InitiateCallCommand, CallDto>
{
    public async Task<CallDto> Handle(InitiateCallCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var conversation = await conversationRepository.GetWithParticipantsAsync(request.ConversationId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Conversation), request.ConversationId);

        var participants = await participantRepository.GetByConversationIdAsync(request.ConversationId, cancellationToken);
        var isParticipant = participants.Any(p => p.User?.KeycloakId == userId);
        if (!isParticipant)
            throw new ForbiddenException("You are not a participant of this conversation.");

        var roomName = $"call-{request.ConversationId}";
        var maxParticipants = conversation.Participants.Count;

        await callService.CreateRoomAsync(roomName, maxParticipants, cancellationToken);

        return new CallDto(roomName, request.ConversationId, request.IsVideo);
    }
}
