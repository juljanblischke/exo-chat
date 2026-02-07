using ExoChat.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ExoChat.Infrastructure.Persistence.Configurations;

public class UserPrivacySettingsConfiguration : IEntityTypeConfiguration<UserPrivacySettings>
{
    public void Configure(EntityTypeBuilder<UserPrivacySettings> builder)
    {
        builder.HasKey(s => s.Id);
        builder.HasIndex(s => s.UserId).IsUnique();

        builder.HasOne(s => s.User)
            .WithOne(u => u.PrivacySettings)
            .HasForeignKey<UserPrivacySettings>(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
