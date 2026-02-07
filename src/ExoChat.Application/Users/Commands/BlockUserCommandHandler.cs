using ExoChat.Application.Common.Interfaces;
using ExoChat.Domain.Entities;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Users.Commands;

public class BlockUserCommandHandler(
    IBlockedUserRepository blockedUserRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<BlockUserCommand>
{
    public async Task Handle(BlockUserCommand request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        if (currentUser.Id == request.BlockedUserId)
            throw new ConflictException("You cannot block yourself.");

        var alreadyBlocked = await blockedUserRepository.IsBlockedAsync(currentUser.Id, request.BlockedUserId, cancellationToken);
        if (alreadyBlocked)
            return;

        var blockedUser = new BlockedUser
        {
            BlockerUserId = currentUser.Id,
            BlockedUserId = request.BlockedUserId
        };

        await blockedUserRepository.AddAsync(blockedUser, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
