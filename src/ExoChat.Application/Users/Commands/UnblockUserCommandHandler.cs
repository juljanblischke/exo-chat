using ExoChat.Application.Common.Interfaces;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Users.Commands;

public class UnblockUserCommandHandler(
    IBlockedUserRepository blockedUserRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<UnblockUserCommand>
{
    public async Task Handle(UnblockUserCommand request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var blockEntry = await blockedUserRepository.GetBlockEntryAsync(currentUser.Id, request.BlockedUserId, cancellationToken)
            ?? throw new NotFoundException("BlockedUser", request.BlockedUserId);

        blockedUserRepository.Delete(blockEntry);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
