namespace ExoChat.Application.Common.Models;

public class CursorPagedResult<T>
{
    public IReadOnlyList<T> Items { get; }
    public string? NextCursor { get; }
    public string? PreviousCursor { get; }
    public bool HasMore { get; }

    public CursorPagedResult(IReadOnlyList<T> items, string? nextCursor, string? previousCursor, bool hasMore)
    {
        Items = items;
        NextCursor = nextCursor;
        PreviousCursor = previousCursor;
        HasMore = hasMore;
    }
}
