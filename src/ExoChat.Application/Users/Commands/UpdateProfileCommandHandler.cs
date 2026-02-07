using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Users.DTOs;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Users.Commands;

public class UpdateProfileCommandHandler(
    IUserRepository userRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork) : IRequestHandler<UpdateProfileCommand, UserProfileDto>
{
    public async Task<UserProfileDto> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        if (request.DisplayName is not null)
            currentUser.DisplayName = request.DisplayName;

        if (request.AvatarUrl is not null)
            currentUser.AvatarUrl = request.AvatarUrl;

        currentUser.StatusMessage = request.StatusMessage;

        userRepository.Update(currentUser);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new UserProfileDto(
            currentUser.Id,
            currentUser.DisplayName,
            currentUser.AvatarUrl,
            currentUser.StatusMessage,
            currentUserService.Email);
    }
}
