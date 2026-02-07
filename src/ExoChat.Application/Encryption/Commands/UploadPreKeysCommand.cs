using ExoChat.Application.Encryption.DTOs;
using MediatR;

namespace ExoChat.Application.Encryption.Commands;

public record UploadPreKeysCommand(KeyUploadDto Keys) : IRequest<Unit>;
