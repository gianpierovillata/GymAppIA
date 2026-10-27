namespace GymApi.Application.Features.Plans.Dtos;

public record CreatePlanRequest(
    string Name,
    string? Description,
    decimal ReferencePrice,
    int DurationDays);
