using ExoChat.Application.Calls.DTOs;
using ExoChat.Application.Common.Interfaces;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Calls.Queries;

public class GetCallStatusQueryHandler(
    ICallService callService,
    IConversationRepository conversationRepository,
    IParticipantRepository participantRepository,
    ICurrentUserService currentUserService) : IRequestHandler<GetCallStatusQuery, CallRoomStatusDto?>
{
    public async Task<CallRoomStatusDto?> Handle(GetCallStatusQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId
            ?? throw new ForbiddenException();

        _ = await conversationRepository.GetByIdAsync(request.ConversationId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Conversation), request.ConversationId);

        var participants = await participantRepository.GetByConversationIdAsync(request.ConversationId, cancellationToken);
        var isParticipant = participants.Any(p => p.User?.KeycloakId == userId);
        if (!isParticipant)
            throw new ForbiddenException("You are not a participant of this conversation.");

        var roomName = $"call-{request.ConversationId}";
        var status = await callService.GetRoomStatusAsync(roomName, cancellationToken);

        if (status is null)
            return null;

        return new CallRoomStatusDto(
            status.RoomName,
            status.NumParticipants,
            status.MaxParticipants,
            status.IsActive);
    }
}
