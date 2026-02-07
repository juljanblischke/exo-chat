using ExoChat.Application.Common.Interfaces;
using ExoChat.Application.Common.Models;
using ExoChat.Application.Messages.DTOs;
using ExoChat.Shared.Exceptions;
using MediatR;

namespace ExoChat.Application.Messages.Queries;

public class SearchMessagesQueryHandler(
    IMessageRepository messageRepository,
    IParticipantRepository participantRepository,
    IUserRepository userRepository,
    ICurrentUserService currentUserService) : IRequestHandler<SearchMessagesQuery, PagedResult<SearchResultDto>>
{
    public async Task<PagedResult<SearchResultDto>> Handle(SearchMessagesQuery request, CancellationToken cancellationToken)
    {
        var currentKeycloakId = currentUserService.UserId
            ?? throw new ForbiddenException();

        var currentUser = await userRepository.GetByKeycloakIdAsync(currentKeycloakId, cancellationToken)
            ?? throw new NotFoundException("User", currentKeycloakId);

        // Get all conversation IDs the user is a member of
        var participants = await participantRepository.FindAsync(p => p.UserId == currentUser.Id, cancellationToken);
        var conversationIds = participants.Select(p => p.ConversationId).ToList();

        if (conversationIds.Count == 0)
            return new PagedResult<SearchResultDto>([], 0, request.PageNumber, request.PageSize);

        var searchResults = await messageRepository.SearchMessagesAsync(
            request.SearchTerm,
            conversationIds,
            request.ConversationId,
            request.DateFrom,
            request.DateTo,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var dtos = searchResults.Items.Select(r => new SearchResultDto(
            r.MessageId,
            r.ContentSnippet,
            r.ConversationId,
            r.ConversationName,
            r.SenderName,
            r.SenderAvatarUrl,
            r.SentAt)).ToList();

        return new PagedResult<SearchResultDto>(dtos, searchResults.TotalCount, searchResults.Page, searchResults.PageSize);
    }
}
