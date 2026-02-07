using ExoChat.Application.Calls.DTOs;
using ExoChat.Application.Common.Interfaces;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Calls.Commands;

public class JoinCallCommandHandler(
    ICallService callService,
    IConversationRepository conversationRepository,
    IParticipantRepository participantRepository,
    ICurrentUserService currentUserService) : IRequestHandler<JoinCallCommand, CallTokenDto>
{
    public async Task<CallTokenDto> Handle(JoinCallCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId
            ?? throw new ForbiddenException();
        var displayName = currentUserService.DisplayName ?? "Unknown";

        _ = await conversationRepository.GetByIdAsync(request.ConversationId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Conversation), request.ConversationId);

        var participants = await participantRepository.GetByConversationIdAsync(request.ConversationId, cancellationToken);
        var isParticipant = participants.Any(p => p.User?.KeycloakId == userId);
        if (!isParticipant)
            throw new ForbiddenException("You are not a participant of this conversation.");

        var roomName = $"call-{request.ConversationId}";
        var token = await callService.GenerateTokenAsync(userId, displayName, roomName, cancellationToken);
        var liveKitUrl = callService.GetServerUrl();

        return new CallTokenDto(token, roomName, liveKitUrl);
    }
}
