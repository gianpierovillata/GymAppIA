using GymApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GymApi.Infrastructure.Persistence.Configurations;

public class ClientMeasurementConfiguration : IEntityTypeConfiguration<ClientMeasurement>
{
    public void Configure(EntityTypeBuilder<ClientMeasurement> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.WeightKg).HasPrecision(6, 2);

        builder.Property(e => e.HeightCm).HasPrecision(6, 2);

        builder.Property(e => e.BodyFatPercentage).HasPrecision(5, 2);

        builder.Property(e => e.MuscleMassKg).HasPrecision(6, 2);

        builder.Property(e => e.WaistCm).HasPrecision(6, 2);

        builder.Property(e => e.Notes).HasMaxLength(500);

        builder.HasOne(e => e.Client)
            .WithMany(c => c.Measurements)
            .HasForeignKey(e => e.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => new { e.ClientId, e.MeasuredOn });
    }
}
