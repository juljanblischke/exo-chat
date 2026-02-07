namespace ExoChat.Shared.Exceptions;

public class ExoChatException : Exception
{
    public ExoChatException(string message) : base(message) { }
    public ExoChatException(string message, Exception innerException) : base(message, innerException) { }
}
