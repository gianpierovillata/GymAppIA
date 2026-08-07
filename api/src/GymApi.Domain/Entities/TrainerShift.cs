using GymApi.Domain.Common;
using GymApi.Domain.Enums;

namespace GymApi.Domain.Entities;

public class TrainerShift : AuditableEntity
{
    public Guid TrainerId { get; set; }

    public WeekDay DayOfWeek { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public Trainer Trainer { get; set; } = null!;
}
