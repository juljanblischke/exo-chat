using ExoChat.Application.Common.Interfaces;
using ExoChat.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Application.Messages.Commands;

public class DeleteMessageCommandHandler(
    IMessageRepository messageRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<DeleteMessageCommand, Unit>
{
    public async Task<Unit> Handle(DeleteMessageCommand request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var message = await messageRepository.Query()
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(m => m.Id == request.MessageId && m.ConversationId == request.ConversationId, cancellationToken)
            ?? throw new NotFoundException("Message", request.MessageId);

        if (message.SenderId != currentUser.Id)
            throw new ForbiddenException("You can only delete your own messages.");

        if (message.DeletedAt is not null)
            throw new ConflictException("Message is already deleted.");

        // Soft delete
        message.DeletedAt = DateTime.UtcNow;
        message.Content = "Message deleted";

        messageRepository.Update(message);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
