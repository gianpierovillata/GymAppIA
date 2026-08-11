using GymApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GymApi.Infrastructure.Persistence.Configurations;

public class ClientConfiguration : IEntityTypeConfiguration<Client>
{
    public void Configure(EntityTypeBuilder<Client> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Email)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(e => e.Phone)
            .HasMaxLength(30);

        builder.Property(e => e.Address)
            .HasMaxLength(250);

        builder.HasIndex(e => e.Email)
            .IsUnique();

        builder.HasMany(e => e.ClientPlans)
            .WithOne(cp => cp.Client)
            .HasForeignKey(cp => cp.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Trainer)
            .WithMany(t => t.Clients)
            .HasForeignKey(e => e.TrainerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(e => e.Measurements)
            .WithOne(m => m.Client)
            .HasForeignKey(m => m.ClientId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
