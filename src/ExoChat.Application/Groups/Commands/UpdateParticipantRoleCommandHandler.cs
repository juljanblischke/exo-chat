using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Enums;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Groups.Commands;

public class UpdateParticipantRoleCommandHandler(
    IConversationRepository conversationRepository,
    IParticipantRepository participantRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<UpdateParticipantRoleCommand, Unit>
{
    public async Task<Unit> Handle(UpdateParticipantRoleCommand request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var conversation = await conversationRepository.GetWithParticipantsAsync(request.ConversationId, cancellationToken)
            ?? throw new NotFoundException("Conversation", request.ConversationId);

        if (conversation.Type != ConversationType.Group)
            throw new ConflictException("Can only change roles in group conversations.");

        var currentParticipant = conversation.Participants.FirstOrDefault(p => p.UserId == currentUser.Id)
            ?? throw new ForbiddenException("You are not a participant in this conversation.");

        if (currentParticipant.Role != ParticipantRole.Owner)
            throw new ForbiddenException("Only the owner can change participant roles.");

        var targetParticipant = conversation.Participants.FirstOrDefault(p => p.UserId == request.UserId)
            ?? throw new NotFoundException("Participant", request.UserId);

        if (targetParticipant.UserId == currentUser.Id)
            throw new ConflictException("Cannot change your own role.");

        // Handle ownership transfer
        if (request.NewRole == ParticipantRole.Owner)
        {
            currentParticipant.Role = ParticipantRole.Admin;
            participantRepository.Update(currentParticipant);
        }

        targetParticipant.Role = request.NewRole;
        participantRepository.Update(targetParticipant);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
