using FluentValidation;

namespace ExoChat.Application.Files.Commands;

public class UploadFileCommandValidator : AbstractValidator<UploadFileCommand>
{
    private const long MaxFileSize = 50 * 1024 * 1024; // 50 MB

    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/zip"
    };

    public UploadFileCommandValidator()
    {
        RuleFor(x => x.FileName)
            .NotEmpty().WithMessage("File name is required.")
            .MaximumLength(255).WithMessage("File name must not exceed 255 characters.");

        RuleFor(x => x.ContentType)
            .NotEmpty().WithMessage("Content type is required.")
            .Must(ct => AllowedContentTypes.Contains(ct))
            .WithMessage("File type is not allowed. Supported types: JPEG, PNG, GIF, WebP, PDF, DOC, DOCX, ZIP.");

        RuleFor(x => x.Size)
            .GreaterThan(0).WithMessage("File size must be greater than zero.")
            .LessThanOrEqualTo(MaxFileSize).WithMessage($"File size must not exceed {MaxFileSize / (1024 * 1024)} MB.");

        RuleFor(x => x.FileStream)
            .NotNull().WithMessage("File stream is required.");
    }
}
