using ExoChat.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ExoChat.Infrastructure.Persistence.Configurations;

public class FileAttachmentConfiguration : IEntityTypeConfiguration<FileAttachment>
{
    public void Configure(EntityTypeBuilder<FileAttachment> builder)
    {
        builder.HasKey(f => f.Id);
        builder.HasIndex(f => f.MessageId);
        builder.Property(f => f.FileName).HasMaxLength(255).IsRequired();
        builder.Property(f => f.ContentType).HasMaxLength(100).IsRequired();
        builder.Property(f => f.StorageKey).HasMaxLength(500).IsRequired();
        builder.Property(f => f.ThumbnailKey).HasMaxLength(500);

        builder.HasOne(f => f.Message)
            .WithMany(m => m.Attachments)
            .HasForeignKey(f => f.MessageId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
