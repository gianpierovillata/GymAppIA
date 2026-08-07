using GymApi.Domain.Common;
using GymApi.Domain.Enums;

namespace GymApi.Domain.Entities;

public class ClientPlan : AuditableEntity
{
    public Guid ClientId { get; set; }

    public Guid PlanId { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public PlanStatus Status { get; set; } = PlanStatus.Active;

    public Client Client { get; set; } = null!;

    public Plan Plan { get; set; } = null!;
}
