using GymApi.Domain.Common;

namespace GymApi.Domain.Entities;

public class Client : AuditableEntity
{
    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? Phone { get; set; }

    public DateOnly? BirthDate { get; set; }

    public string? Address { get; set; }

    public ICollection<ClientPlan> ClientPlans { get; set; } = [];
}
