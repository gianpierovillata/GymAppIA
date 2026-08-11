using GymApi.Domain.Entities;

namespace GymApi.Application.Features.ClientMeasurements.Dtos;

public record ClientMeasurementResponse(
    Guid Id,
    Guid ClientId,
    DateOnly MeasuredOn,
    decimal? WeightKg,
    decimal? HeightCm,
    decimal? BodyFatPercentage,
    decimal? MuscleMassKg,
    decimal? WaistCm,
    string? Notes)
{
    public static ClientMeasurementResponse From(ClientMeasurement m) =>
        new(
            m.Id,
            m.ClientId,
            m.MeasuredOn,
            m.WeightKg,
            m.HeightCm,
            m.BodyFatPercentage,
            m.MuscleMassKg,
            m.WaistCm,
            m.Notes);
}
