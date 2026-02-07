using ExoChat.Application.Encryption.DTOs;
using MediatR;

namespace ExoChat.Application.Encryption.Commands;

public record RotateSignedPreKeyCommand(SignedPreKeyUploadDto SignedPreKey) : IRequest<Unit>;
