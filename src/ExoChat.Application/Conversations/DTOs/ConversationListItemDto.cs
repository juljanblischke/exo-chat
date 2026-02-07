using ExoChat.Domain.Enums;

namespace ExoChat.Application.Conversations.DTOs;

public record ConversationListItemDto(
    Guid Id,
    ConversationType Type,
    DateTime? UpdatedAt,
    GroupInfoDto? Group,
    IReadOnlyList<ParticipantDto> Participants,
    LastMessageDto? LastMessage,
    int UnreadCount);

public record LastMessageDto(
    Guid Id,
    string Content,
    string SenderDisplayName,
    DateTime CreatedAt);
