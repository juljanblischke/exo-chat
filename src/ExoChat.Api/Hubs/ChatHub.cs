using System.Security.Claims;
using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Messages.Commands;
using ExoChat.Application.Messages.DTOs;
using ExoChat.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ExoChat.Api.Hubs;

[Authorize]
public class ChatHub(
    IMediator mediator,
    IServiceScopeFactory scopeFactory,
    ILogger<ChatHub> logger) : Hub
{
    public async Task JoinConversation(Guid conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId.ToString());
        logger.LogInformation("User {UserId} joined conversation {ConversationId}",
            Context.UserIdentifier, conversationId);
    }

    public async Task LeaveConversation(Guid conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId.ToString());
        logger.LogInformation("User {UserId} left conversation {ConversationId}",
            Context.UserIdentifier, conversationId);
    }

    public async Task SendMessage(Guid conversationId, string content)
    {
        var result = await mediator.Send(new SendMessageCommand(conversationId, content));

        await Clients.Group(conversationId.ToString())
            .SendAsync("ReceiveMessage", result);
    }

    public async Task StartTyping(Guid conversationId)
    {
        var userId = Context.UserIdentifier;
        var displayName = Context.User?.FindFirstValue("preferred_username")
            ?? Context.User?.FindFirstValue(ClaimTypes.Name)
            ?? "Unknown";

        await Clients.OthersInGroup(conversationId.ToString())
            .SendAsync("UserTyping", new { UserId = userId, DisplayName = displayName, ConversationId = conversationId });
    }

    public async Task StopTyping(Guid conversationId)
    {
        var userId = Context.UserIdentifier;

        await Clients.OthersInGroup(conversationId.ToString())
            .SendAsync("UserStoppedTyping", new { UserId = userId, ConversationId = conversationId });
    }

    public async Task MarkAsRead(Guid conversationId, Guid messageId)
    {
        var userId = Context.UserIdentifier;

        // Update the participant's LastReadMessageId
        using var scope = scopeFactory.CreateScope();
        var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        var participantRepository = scope.ServiceProvider.GetRequiredService<IParticipantRepository>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        if (userId is null) return;

        var user = await userRepository.GetByKeycloakIdAsync(userId);
        if (user is null) return;

        var participants = await participantRepository.GetByConversationIdAsync(conversationId);
        var participant = participants.FirstOrDefault(p => p.UserId == user.Id);
        if (participant is null) return;

        participant.LastReadMessageId = messageId;
        participantRepository.Update(participant);
        await unitOfWork.SaveChangesAsync();

        await Clients.OthersInGroup(conversationId.ToString())
            .SendAsync("MessageRead", new { UserId = userId, ConversationId = conversationId, MessageId = messageId });
    }

    public async Task UpdateOnlineStatus(OnlineStatus status)
    {
        var userId = Context.UserIdentifier;
        if (userId is null) return;

        using var scope = scopeFactory.CreateScope();
        var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var user = await userRepository.GetByKeycloakIdAsync(userId);
        if (user is null) return;

        user.OnlineStatus = status;
        user.LastSeenAt = DateTime.UtcNow;
        userRepository.Update(user);
        await unitOfWork.SaveChangesAsync();

        await Clients.All.SendAsync("UserStatusChanged", new { UserId = userId, Status = status });
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (userId is not null)
        {
            using var scope = scopeFactory.CreateScope();
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            var user = await userRepository.GetByKeycloakIdAsync(userId);
            if (user is not null)
            {
                user.OnlineStatus = OnlineStatus.Online;
                user.LastSeenAt = DateTime.UtcNow;
                userRepository.Update(user);
                await unitOfWork.SaveChangesAsync();

                await Clients.All.SendAsync("UserStatusChanged",
                    new { UserId = userId, Status = OnlineStatus.Online });
            }
        }

        logger.LogInformation("User {UserId} connected to ChatHub", userId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        if (userId is not null)
        {
            using var scope = scopeFactory.CreateScope();
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            var user = await userRepository.GetByKeycloakIdAsync(userId);
            if (user is not null)
            {
                user.OnlineStatus = OnlineStatus.Offline;
                user.LastSeenAt = DateTime.UtcNow;
                userRepository.Update(user);
                await unitOfWork.SaveChangesAsync();

                await Clients.All.SendAsync("UserStatusChanged",
                    new { UserId = userId, Status = OnlineStatus.Offline });
            }
        }

        logger.LogInformation("User {UserId} disconnected from ChatHub", userId);
        await base.OnDisconnectedAsync(exception);
    }
}
