namespace GymApi.Application.Features.ClientMeasurements.Dtos;

public record CreateClientMeasurementRequest(
    DateOnly MeasuredOn,
    decimal? WeightKg,
    decimal? HeightCm,
    decimal? BodyFatPercentage,
    decimal? MuscleMassKg,
    decimal? WaistCm,
    string? Notes);
