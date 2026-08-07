using GymApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GymApi.Infrastructure.Persistence.Configurations;

public class PlanConfiguration : IEntityTypeConfiguration<Plan>
{
    public void Configure(EntityTypeBuilder<Plan> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.ReferencePrice)
            .IsRequired()
            .HasPrecision(10, 2);

        builder.HasMany(e => e.ClientPlans)
            .WithOne(cp => cp.Plan)
            .HasForeignKey(cp => cp.PlanId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
