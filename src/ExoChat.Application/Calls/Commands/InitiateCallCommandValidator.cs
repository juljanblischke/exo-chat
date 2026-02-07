using FluentValidation;

namespace ExoChat.Application.Calls.Commands;

public class InitiateCallCommandValidator : AbstractValidator<InitiateCallCommand>
{
    public InitiateCallCommandValidator()
    {
        RuleFor(x => x.ConversationId)
            .NotEmpty().WithMessage("Conversation ID is required.");
    }
}
