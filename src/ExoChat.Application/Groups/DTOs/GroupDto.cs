using ExoChat.Application.Conversations.DTOs;

namespace ExoChat.Application.Groups.DTOs;

public record GroupDto(
    Guid ConversationId,
    string Name,
    string? Description,
    string? AvatarUrl,
    IReadOnlyList<ParticipantDto> Members);
