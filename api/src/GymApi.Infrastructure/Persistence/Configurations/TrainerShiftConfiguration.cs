using GymApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GymApi.Infrastructure.Persistence.Configurations;

public class TrainerShiftConfiguration : IEntityTypeConfiguration<TrainerShift>
{
    public void Configure(EntityTypeBuilder<TrainerShift> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.DayOfWeek)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(e => e.StartTime)
            .IsRequired();

        builder.Property(e => e.EndTime)
            .IsRequired();

        builder.HasOne(e => e.Trainer)
            .WithMany(t => t.Shifts)
            .HasForeignKey(e => e.TrainerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
