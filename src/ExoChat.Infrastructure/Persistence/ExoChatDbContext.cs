using ExoChat.Domain.Entities;
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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ExoChatDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
