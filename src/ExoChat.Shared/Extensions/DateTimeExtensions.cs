namespace ExoChat.Shared.Extensions;

public static class DateTimeExtensions
{
    public static string ToRelativeTime(this DateTime dateTime)
    {
        var timeSpan = DateTime.UtcNow - dateTime;

        return timeSpan.TotalMinutes switch
        {
            < 1 => "just now",
            < 60 => $"{(int)timeSpan.TotalMinutes}m ago",
            < 1440 => $"{(int)timeSpan.TotalHours}h ago",
            < 43200 => $"{(int)timeSpan.TotalDays}d ago",
            _ => dateTime.ToString("MMM dd, yyyy")
        };
    }
}
