using GymApi.Domain.Entities;

namespace GymApi.Application.Features.Plans.Dtos;

public record PlanResponse(
    Guid Id,
    string Name,
    string? Description,
    decimal ReferencePrice,
    int DurationDays,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt)
{
    public static PlanResponse From(Plan plan) =>
        new(
            plan.Id,
            plan.Name,
            plan.Description,
            plan.ReferencePrice,
            plan.DurationDays,
            plan.IsActive,
            plan.CreatedAt,
            plan.UpdatedAt);
}
