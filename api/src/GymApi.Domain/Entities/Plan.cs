using GymApi.Domain.Common;

namespace GymApi.Domain.Entities;

public class Plan : AuditableEntity
{
    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public decimal ReferencePrice { get; set; }

    public int DurationDays { get; set; }

    public ICollection<ClientPlan> ClientPlans { get; set; } = [];
}
