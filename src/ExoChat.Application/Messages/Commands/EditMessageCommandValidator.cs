using FluentValidation;

namespace ExoChat.Application.Messages.Commands;

public class EditMessageCommandValidator : AbstractValidator<EditMessageCommand>
{
    public EditMessageCommandValidator()
    {
        RuleFor(x => x.ConversationId)
            .NotEmpty().WithMessage("Conversation ID is required.");

        RuleFor(x => x.MessageId)
            .NotEmpty().WithMessage("Message ID is required.");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Message content is required.")
            .MaximumLength(10000).WithMessage("Message content must not exceed 10000 characters.");
    }
}
