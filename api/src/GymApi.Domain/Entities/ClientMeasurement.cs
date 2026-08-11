using GymApi.Domain.Common;

namespace GymApi.Domain.Entities;

public class ClientMeasurement : AuditableEntity
{
    public Guid ClientId { get; set; }

    public DateOnly MeasuredOn { get; set; }

    public decimal? WeightKg { get; set; }

    public decimal? HeightCm { get; set; }

    public decimal? BodyFatPercentage { get; set; }

    public decimal? MuscleMassKg { get; set; }

    public decimal? WaistCm { get; set; }

    public string? Notes { get; set; }

    public Client Client { get; set; } = null!;
}
