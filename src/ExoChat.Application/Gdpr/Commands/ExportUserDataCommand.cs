using ExoChat.Application.Gdpr.DTOs;
using MediatR;

namespace ExoChat.Application.Gdpr.Commands;

public record ExportUserDataCommand : IRequest<DataExportDto>;
