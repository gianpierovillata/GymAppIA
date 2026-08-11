using GymApi.Domain.Common;
using GymApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GymApi.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Client> Clients => Set<Client>();

    public DbSet<Trainer> Trainers => Set<Trainer>();

    public DbSet<ClassActivity> ClassActivities => Set<ClassActivity>();

    public DbSet<Schedule> Schedules => Set<Schedule>();

    public DbSet<TrainerShift> TrainerShifts => Set<TrainerShift>();

    public DbSet<Plan> Plans => Set<Plan>();

    public DbSet<ClientPlan> ClientPlans => Set<ClientPlan>();

    public DbSet<ClientMeasurement> ClientMeasurements => Set<ClientMeasurement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
            }

            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
