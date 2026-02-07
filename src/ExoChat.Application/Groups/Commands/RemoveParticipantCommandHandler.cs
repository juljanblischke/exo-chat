using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Enums;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Groups.Commands;

public class RemoveParticipantCommandHandler(
    IConversationRepository conversationRepository,
    IParticipantRepository participantRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<RemoveParticipantCommand, Unit>
{
    public async Task<Unit> Handle(RemoveParticipantCommand request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var conversation = await conversationRepository.GetWithParticipantsAsync(request.ConversationId, cancellationToken)
            ?? throw new NotFoundException("Conversation", request.ConversationId);

        if (conversation.Type != ConversationType.Group)
            throw new ConflictException("Can only remove participants from group conversations.");

        var currentParticipant = conversation.Participants.FirstOrDefault(p => p.UserId == currentUser.Id)
            ?? throw new ForbiddenException("You are not a participant in this conversation.");

        if (currentParticipant.Role < ParticipantRole.Admin)
            throw new ForbiddenException("Only admins and owners can remove participants.");

        var participantToRemove = conversation.Participants.FirstOrDefault(p => p.UserId == request.UserId)
            ?? throw new NotFoundException("Participant", request.UserId);

        // Cannot remove someone with equal or higher role
        if (participantToRemove.Role >= currentParticipant.Role)
            throw new ForbiddenException("Cannot remove a participant with equal or higher role.");

        participantRepository.Delete(participantToRemove);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
