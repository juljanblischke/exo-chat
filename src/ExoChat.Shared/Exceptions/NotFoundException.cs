namespace ExoChat.Shared.Exceptions;

public class NotFoundException : ExoChatException
{
    public NotFoundException(string message)
        : base(message) { }

    public NotFoundException(string entityName, object key)
        : base($"{entityName} with key '{key}' was not found.") { }
}
