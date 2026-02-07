using ExoChat.Domain.Enums;

namespace ExoChat.Application.Conversations.DTOs;

public record ConversationDto(
    Guid Id,
    ConversationType Type,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    GroupInfoDto? Group,
    IReadOnlyList<ParticipantDto> Participants);

public record GroupInfoDto(
    string Name,
    string? Description,
    string? AvatarUrl);
