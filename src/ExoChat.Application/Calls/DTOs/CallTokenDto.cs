namespace ExoChat.Application.Calls.DTOs;

public record CallTokenDto(
    string Token,
    string RoomName,
    string LiveKitUrl);
