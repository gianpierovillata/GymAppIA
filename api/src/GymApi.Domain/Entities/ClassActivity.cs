using GymApi.Domain.Common;
using GymApi.Domain.Enums;

namespace GymApi.Domain.Entities;

public class ClassActivity : AuditableEntity
{
    public string Name { get; set; } = null!;

    public ClassCategory Category { get; set; }

    public string? Description { get; set; }

    public int DurationMinutes { get; set; }

    public int Capacity { get; set; }

    public ICollection<Schedule> Schedules { get; set; } = [];
}
