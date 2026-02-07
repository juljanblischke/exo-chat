using FluentValidation;

namespace ExoChat.Application.Encryption.Commands;

public class RotateSignedPreKeyCommandValidator : AbstractValidator<RotateSignedPreKeyCommand>
{
    public RotateSignedPreKeyCommandValidator()
    {
        RuleFor(x => x.SignedPreKey).NotNull().WithMessage("Signed pre-key is required.");

        RuleFor(x => x.SignedPreKey.PublicKey)
            .NotEmpty().WithMessage("Public key is required.");

        RuleFor(x => x.SignedPreKey.PrivateKeyEncrypted)
            .NotEmpty().WithMessage("Encrypted private key is required.");

        RuleFor(x => x.SignedPreKey.Signature)
            .NotEmpty().WithMessage("Signature is required.");
    }
}
