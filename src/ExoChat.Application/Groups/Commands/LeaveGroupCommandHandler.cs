using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Enums;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Groups.Commands;

public class LeaveGroupCommandHandler(
    IConversationRepository conversationRepository,
    IParticipantRepository participantRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<LeaveGroupCommand, Unit>
{
    public async Task<Unit> Handle(LeaveGroupCommand request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var conversation = await conversationRepository.GetWithParticipantsAsync(request.ConversationId, cancellationToken)
            ?? throw new NotFoundException("Conversation", request.ConversationId);

        if (conversation.Type != ConversationType.Group)
            throw new ConflictException("Can only leave group conversations.");

        var currentParticipant = conversation.Participants.FirstOrDefault(p => p.UserId == currentUser.Id)
            ?? throw new ForbiddenException("You are not a participant in this conversation.");

        // If the owner is leaving, transfer ownership
        if (currentParticipant.Role == ParticipantRole.Owner)
        {
            var otherParticipants = conversation.Participants
                .Where(p => p.UserId != currentUser.Id)
                .OrderByDescending(p => p.Role)
                .ThenBy(p => p.JoinedAt)
                .ToList();

            if (otherParticipants.Count == 0)
            {
                // Last person leaving - delete the conversation
                conversationRepository.Delete(conversation);
                await unitOfWork.SaveChangesAsync(cancellationToken);
                return Unit.Value;
            }

            // Transfer ownership to the oldest admin, or oldest member if no admins
            var newOwner = otherParticipants.First();
            newOwner.Role = ParticipantRole.Owner;
            participantRepository.Update(newOwner);
        }

        participantRepository.Delete(currentParticipant);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
