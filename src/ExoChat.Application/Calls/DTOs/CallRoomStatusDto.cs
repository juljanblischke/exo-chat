namespace ExoChat.Application.Calls.DTOs;

public record CallRoomStatusDto(
    string RoomName,
    int NumParticipants,
    int MaxParticipants,
    bool IsActive);
