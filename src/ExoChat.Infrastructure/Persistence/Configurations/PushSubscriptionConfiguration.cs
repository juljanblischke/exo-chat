using ExoChat.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ExoChat.Infrastructure.Persistence.Configurations;

public class PushSubscriptionConfiguration : IEntityTypeConfiguration<PushSubscription>
{
    public void Configure(EntityTypeBuilder<PushSubscription> builder)
    {
        builder.HasKey(p => p.Id);
        builder.HasIndex(p => p.UserId);
        builder.HasIndex(p => p.Endpoint).IsUnique();
        builder.Property(p => p.Endpoint).HasMaxLength(500).IsRequired();
        builder.Property(p => p.P256dhKey).HasMaxLength(500).IsRequired();
        builder.Property(p => p.AuthKey).HasMaxLength(500).IsRequired();
        builder.Property(p => p.UserAgent).HasMaxLength(500);

        builder.HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
