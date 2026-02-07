namespace ExoChat.Shared.Exceptions;

public class ForbiddenException : ExoChatException
{
    public ForbiddenException(string message = "You do not have permission to perform this action.")
        : base(message) { }
}
