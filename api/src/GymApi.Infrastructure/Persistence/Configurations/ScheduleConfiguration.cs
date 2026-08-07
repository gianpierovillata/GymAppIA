using GymApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GymApi.Infrastructure.Persistence.Configurations;

public class ScheduleConfiguration : IEntityTypeConfiguration<Schedule>
{
    public void Configure(EntityTypeBuilder<Schedule> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.DayOfWeek)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(e => e.StartTime)
            .IsRequired();

        builder.Property(e => e.EndTime)
            .IsRequired();

        builder.Property(e => e.Room)
            .HasMaxLength(100);

        builder.HasOne(e => e.ClassActivity)
            .WithMany(ca => ca.Schedules)
            .HasForeignKey(e => e.ClassActivityId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Trainer)
            .WithMany(t => t.Schedules)
            .HasForeignKey(e => e.TrainerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
