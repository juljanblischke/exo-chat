using ExoChat.Domain.Entities.Encryption;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ExoChat.Infrastructure.Persistence.Configurations;

public class IdentityKeyConfiguration : IEntityTypeConfiguration<IdentityKey>
{
    public void Configure(EntityTypeBuilder<IdentityKey> builder)
    {
        builder.HasKey(k => k.Id);
        builder.HasIndex(k => k.UserId).IsUnique();

        builder.Property(k => k.PublicKey).IsRequired();
        builder.Property(k => k.PrivateKeyEncrypted).IsRequired();

        builder.HasOne(k => k.User)
            .WithOne()
            .HasForeignKey<IdentityKey>(k => k.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
