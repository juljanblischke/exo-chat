using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Common.Models;
using ExoChat.Application.Conversations.DTOs;
using ExoChat.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Application.Conversations.Queries;

public class GetConversationsQueryHandler(
    IConversationRepository conversationRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService) : IRequestHandler<GetConversationsQuery, PagedResult<ConversationListItemDto>>
{
    public async Task<PagedResult<ConversationListItemDto>> Handle(GetConversationsQuery request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        var query = conversationRepository.Query()
            .Where(c => c.Participants.Any(p => p.UserId == currentUser.Id))
            .Include(c => c.Group)
            .Include(c => c.Participants).ThenInclude(p => p.User)
            .Include(c => c.Messages.OrderByDescending(m => m.CreatedAt).Take(1))
                .ThenInclude(m => m.Sender)
            .OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var conversations = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var items = conversations.Select(c =>
        {
            var lastMessage = c.Messages.OrderByDescending(m => m.CreatedAt).FirstOrDefault();
            var participant = c.Participants.FirstOrDefault(p => p.UserId == currentUser.Id);

            // Count unread messages (messages after the last read message)
            var unreadCount = 0;
            if (participant?.LastReadMessageId is not null && lastMessage is not null)
            {
                // Simple: if the last message ID differs from last read, count as unread
                unreadCount = lastMessage.Id != participant.LastReadMessageId ? 1 : 0;
            }
            else if (participant?.LastReadMessageId is null && lastMessage is not null)
            {
                unreadCount = 1;
            }

            return new ConversationListItemDto(
                c.Id,
                c.Type,
                c.UpdatedAt,
                c.Group is not null ? new GroupInfoDto(c.Group.Name, c.Group.Description, c.Group.AvatarUrl) : null,
                c.Participants.Select(p => new ParticipantDto(
                    p.UserId,
                    p.User.DisplayName,
                    p.User.AvatarUrl,
                    p.Role,
                    p.JoinedAt,
                    p.LastReadMessageId)).ToList(),
                lastMessage is not null
                    ? new LastMessageDto(lastMessage.Id, lastMessage.Content, lastMessage.Sender.DisplayName, lastMessage.CreatedAt)
                    : null,
                unreadCount);
        }).ToList();

        return new PagedResult<ConversationListItemDto>(items, totalCount, request.Page, request.PageSize);
    }
}
