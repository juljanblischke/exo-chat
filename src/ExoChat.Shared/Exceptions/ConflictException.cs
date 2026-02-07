namespace ExoChat.Shared.Exceptions;

public class ConflictException : ExoChatException
{
    public ConflictException(string message) : base(message) { }
}
