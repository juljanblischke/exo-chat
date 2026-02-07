using ExoChat.Application.Common.Interfaces;
using ExoChat.Infrastructure.Options;
using Livekit.Server.Sdk.Dotnet;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ExoChat.Infrastructure.Services;

public class LiveKitCallService : ICallService
{
    private readonly RoomServiceClient _roomService;
    private readonly LiveKitOptions _options;
    private readonly ILogger<LiveKitCallService> _logger;

    public LiveKitCallService(IOptions<LiveKitOptions> options, ILogger<LiveKitCallService> logger)
    {
        _options = options.Value;
        _logger = logger;
        _roomService = new RoomServiceClient(_options.Host, _options.ApiKey, _options.ApiSecret);
    }

    public async Task<string> CreateRoomAsync(string roomName, int maxParticipants = 0, CancellationToken cancellationToken = default)
    {
        var request = new CreateRoomRequest
        {
            Name = roomName,
            EmptyTimeout = 300, // 5 minutes
            MaxParticipants = (uint)maxParticipants
        };

        var room = await _roomService.CreateRoom(request);
        _logger.LogInformation("Created LiveKit room: {RoomName}", room.Name);
        return room.Name;
    }

    public Task<string> GenerateTokenAsync(string userId, string displayName, string roomName, CancellationToken cancellationToken = default)
    {
        var token = new AccessToken(_options.ApiKey, _options.ApiSecret)
            .WithIdentity(userId)
            .WithName(displayName)
            .WithGrants(new VideoGrants
            {
                RoomJoin = true,
                Room = roomName,
                CanPublish = true,
                CanSubscribe = true,
                CanPublishData = true
            })
            .WithTtl(TimeSpan.FromHours(6))
            .ToJwt();

        _logger.LogInformation("Generated LiveKit token for user {UserId} in room {RoomName}", userId, roomName);
        return Task.FromResult(token);
    }

    public async Task EndCallAsync(string roomName, CancellationToken cancellationToken = default)
    {
        await _roomService.DeleteRoom(new DeleteRoomRequest { Room = roomName });
        _logger.LogInformation("Deleted LiveKit room: {RoomName}", roomName);
    }

    public async Task<CallRoomStatus?> GetRoomStatusAsync(string roomName, CancellationToken cancellationToken = default)
    {
        var response = await _roomService.ListRooms(new ListRoomsRequest { Names = { roomName } });
        var room = response.Rooms.FirstOrDefault();

        if (room is null)
            return null;

        return new CallRoomStatus(
            room.Name,
            (int)room.NumParticipants,
            (int)room.MaxParticipants,
            room.NumParticipants > 0);
    }

    public string GetServerUrl() => _options.Host;
}
