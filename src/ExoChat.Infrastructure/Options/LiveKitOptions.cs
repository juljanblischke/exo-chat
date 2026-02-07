namespace ExoChat.Infrastructure.Options;

public class LiveKitOptions
{
    public const string SectionName = "LiveKit";

    public string ApiKey { get; set; } = string.Empty;
    public string ApiSecret { get; set; } = string.Empty;
    public string Host { get; set; } = "http://localhost:7880";
}
