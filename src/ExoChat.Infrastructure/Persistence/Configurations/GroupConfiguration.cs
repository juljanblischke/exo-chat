using ExoChat.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ExoChat.Infrastructure.Persistence.Configurations;

public class GroupConfiguration : IEntityTypeConfiguration<Group>
{
    public void Configure(EntityTypeBuilder<Group> builder)
    {
        builder.HasKey(g => g.Id);
        builder.HasIndex(g => g.ConversationId).IsUnique();
        builder.Property(g => g.Name).HasMaxLength(100).IsRequired();
        builder.Property(g => g.Description).HasMaxLength(500);
        builder.Property(g => g.AvatarUrl).HasMaxLength(500);

        builder.HasOne(g => g.Conversation)
            .WithOne(c => c.Group)
            .HasForeignKey<Group>(g => g.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
