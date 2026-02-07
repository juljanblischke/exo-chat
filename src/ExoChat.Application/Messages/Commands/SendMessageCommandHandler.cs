using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Messages.DTOs;
using ExoChat.Domain.Entities;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Messages.Commands;

public class SendMessageCommandHandler(
    IConversationRepository conversationRepository,
    IMessageRepository messageRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<SendMessageCommand, MessageDto>
{
    public async Task<MessageDto> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var conversation = await conversationRepository.GetWithParticipantsAsync(request.ConversationId, cancellationToken)
            ?? throw new NotFoundException("Conversation", request.ConversationId);

        if (!conversation.Participants.Any(p => p.UserId == currentUser.Id))
            throw new ForbiddenException("You are not a participant in this conversation.");

        var message = new Message
        {
            ConversationId = request.ConversationId,
            SenderId = currentUser.Id,
            Content = request.Content,
            MessageType = request.MessageType
        };

        await messageRepository.AddAsync(message, cancellationToken);

        // Update conversation's UpdatedAt timestamp
        conversation.UpdatedAt = DateTime.UtcNow;
        conversationRepository.Update(conversation);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new MessageDto(
            message.Id,
            message.ConversationId,
            message.SenderId,
            currentUser.DisplayName,
            currentUser.AvatarUrl,
            message.Content,
            message.MessageType,
            message.IsEncrypted,
            message.CreatedAt,
            message.EditedAt,
            message.DeletedAt,
            []);
    }
}
