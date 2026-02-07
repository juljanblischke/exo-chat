using MediatR;

namespace ExoChat.Application.Files.Commands;

public record DeleteFileCommand(Guid FileId) : IRequest;
