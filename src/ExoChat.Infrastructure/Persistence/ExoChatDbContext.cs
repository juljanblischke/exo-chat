using ExoChat.Domain.Entities;
using ExoChat.Domain.Entities.Encryption;
using Microsoft.EntityFrameworkCore;

namespace ExoChat.Infrastructure.Persistence;

public class ExoChatDbContext(DbContextOptions<ExoChatDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<Participant> Participants => Set<Participant>();
    public DbSet<FileAttachment> FileAttachments => Set<FileAttachment>();

    // Encryption
    public DbSet<IdentityKey> IdentityKeys => Set<IdentityKey>();
    public DbSet<SignedPreKey> SignedPreKeys => Set<SignedPreKey>();
    public DbSet<OneTimePreKey> OneTimePreKeys => Set<OneTimePreKey>();

    // GDPR
    public DbSet<AuditLogEntry> AuditLogEntries => Set<AuditLogEntry>();
    public DbSet<UserConsent> UserConsents => Set<UserConsent>();
    public DbSet<DataExportRequest> DataExportRequests => Set<DataExportRequest>();
    public DbSet<AccountDeletionRequest> AccountDeletionRequests => Set<AccountDeletionRequest>();

    // Notifications & Settings
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<PushSubscription> PushSubscriptions => Set<PushSubscription>();
    public DbSet<NotificationPreference> NotificationPreferences => Set<NotificationPreference>();
    public DbSet<UserPrivacySettings> UserPrivacySettings => Set<UserPrivacySettings>();
    public DbSet<BlockedUser> BlockedUsers => Set<BlockedUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ExoChatDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
