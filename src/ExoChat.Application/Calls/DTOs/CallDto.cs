namespace ExoChat.Application.Calls.DTOs;

public record CallDto(
    string RoomName,
    Guid ConversationId,
    bool IsVideo);
