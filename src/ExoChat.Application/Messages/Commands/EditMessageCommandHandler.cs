using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Messages.DTOs;
using ExoChat.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Application.Messages.Commands;

public class EditMessageCommandHandler(
    IMessageRepository messageRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<EditMessageCommand, MessageDto>
{
    public async Task<MessageDto> Handle(EditMessageCommand request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var message = await messageRepository.Query()
            .Include(m => m.Sender)
            .Include(m => m.Attachments)
            .FirstOrDefaultAsync(m => m.Id == request.MessageId && m.ConversationId == request.ConversationId, cancellationToken)
            ?? throw new NotFoundException("Message", request.MessageId);

        if (message.SenderId != currentUser.Id)
            throw new ForbiddenException("You can only edit your own messages.");

        if (message.DeletedAt is not null)
            throw new ConflictException("Cannot edit a deleted message.");

        message.Content = request.Content;
        message.EditedAt = DateTime.UtcNow;

        messageRepository.Update(message);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new MessageDto(
            message.Id,
            message.ConversationId,
            message.SenderId,
            message.Sender.DisplayName,
            message.Sender.AvatarUrl,
            message.Content,
            message.MessageType,
            message.IsEncrypted,
            message.CreatedAt,
            message.EditedAt,
            message.DeletedAt,
            message.Attachments.Select(a => new FileAttachmentDto(
                a.Id, a.FileName, a.ContentType, a.Size, a.StorageKey, a.ThumbnailKey)).ToList());
    }
}
