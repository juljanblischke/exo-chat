using FluentValidation;

namespace ExoChat.Application.Conversations.Commands;

public class CreateDirectConversationCommandValidator : AbstractValidator<CreateDirectConversationCommand>
{
    public CreateDirectConversationCommandValidator()
    {
        RuleFor(x => x.OtherUserId)
            .NotEmpty().WithMessage("Other user ID is required.");
    }
}
