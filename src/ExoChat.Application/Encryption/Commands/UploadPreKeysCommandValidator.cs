using FluentValidation;

namespace ExoChat.Application.Encryption.Commands;

public class UploadPreKeysCommandValidator : AbstractValidator<UploadPreKeysCommand>
{
    public UploadPreKeysCommandValidator()
    {
        RuleFor(x => x.Keys).NotNull().WithMessage("Keys are required.");

        RuleFor(x => x.Keys.IdentityPublicKey)
            .NotEmpty().WithMessage("Identity public key is required.");

        RuleFor(x => x.Keys.IdentityPrivateKeyEncrypted)
            .NotEmpty().WithMessage("Encrypted identity private key is required.");

        RuleFor(x => x.Keys.SignedPreKey)
            .NotNull().WithMessage("Signed pre-key is required.");

        RuleFor(x => x.Keys.SignedPreKey.PublicKey)
            .NotEmpty().WithMessage("Signed pre-key public key is required.");

        RuleFor(x => x.Keys.SignedPreKey.PrivateKeyEncrypted)
            .NotEmpty().WithMessage("Signed pre-key encrypted private key is required.");

        RuleFor(x => x.Keys.SignedPreKey.Signature)
            .NotEmpty().WithMessage("Signed pre-key signature is required.");

        RuleFor(x => x.Keys.OneTimePreKeys)
            .NotEmpty().WithMessage("At least one one-time pre-key is required.");
    }
}
