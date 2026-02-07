namespace ExoChat.Domain.Enums;

public enum AuditAction
{
    Login,
    Logout,
    MessageSent,
    MessageDeleted,
    MessageEdited,
    FileUploaded,
    FileDeleted,
    DataExported,
    AccountDeletionRequested,
    AccountDeletionCancelled,
    AccountDeleted,
    SettingsChanged,
    ConsentUpdated,
    ConversationCreated,
    GroupUpdated,
    ParticipantAdded,
    ParticipantRemoved
}
