namespace ExoChat.Application.Common.Interfaces;

public interface ICallService
{
    Task<string> CreateRoomAsync(string roomName, int maxParticipants = 0, CancellationToken cancellationToken = default);
    Task<string> GenerateTokenAsync(string userId, string displayName, string roomName, CancellationToken cancellationToken = default);
    Task EndCallAsync(string roomName, CancellationToken cancellationToken = default);
    Task<CallRoomStatus?> GetRoomStatusAsync(string roomName, CancellationToken cancellationToken = default);
    string GetServerUrl();
}

public record CallRoomStatus(
    string RoomName,
    int NumParticipants,
    int MaxParticipants,
    bool IsActive);
