using GymApi.Domain.Common;

namespace GymApi.Domain.Entities;

public class Trainer : AuditableEntity
{
    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? Phone { get; set; }

    public string? Specialty { get; set; }

    public ICollection<Schedule> Schedules { get; set; } = [];

    public ICollection<TrainerShift> Shifts { get; set; } = [];
}
