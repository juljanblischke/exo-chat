using ExoChat.Domain.Entities.Encryption;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ExoChat.Infrastructure.Persistence.Configurations;

public class SignedPreKeyConfiguration : IEntityTypeConfiguration<SignedPreKey>
{
    public void Configure(EntityTypeBuilder<SignedPreKey> builder)
    {
        builder.HasKey(k => k.Id);
        builder.HasIndex(k => new { k.UserId, k.KeyId });

        builder.Property(k => k.PublicKey).IsRequired();
        builder.Property(k => k.PrivateKeyEncrypted).IsRequired();
        builder.Property(k => k.Signature).IsRequired();

        builder.HasOne(k => k.User)
            .WithMany()
            .HasForeignKey(k => k.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
