using GymApi.Domain.Common;
using GymApi.Domain.Enums;

namespace GymApi.Domain.Entities;

public class Schedule : AuditableEntity
{
    public Guid ClassActivityId { get; set; }

    public Guid TrainerId { get; set; }

    public WeekDay DayOfWeek { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public string? Room { get; set; }

    public ClassActivity ClassActivity { get; set; } = null!;

    public Trainer Trainer { get; set; } = null!;
}
