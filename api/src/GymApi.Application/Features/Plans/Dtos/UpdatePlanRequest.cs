namespace GymApi.Application.Features.Plans.Dtos;

public record UpdatePlanRequest(
    string Name,
    string? Description,
    decimal ReferencePrice,
    int DurationDays);
