using GymApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GymApi.Infrastructure.Persistence.Configurations;

public class ClientPlanConfiguration : IEntityTypeConfiguration<ClientPlan>
{
    public void Configure(EntityTypeBuilder<ClientPlan> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.HasOne(e => e.Client)
            .WithMany(c => c.ClientPlans)
            .HasForeignKey(e => e.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Plan)
            .WithMany(p => p.ClientPlans)
            .HasForeignKey(e => e.PlanId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => new { e.ClientId, e.PlanId });
    }
}
