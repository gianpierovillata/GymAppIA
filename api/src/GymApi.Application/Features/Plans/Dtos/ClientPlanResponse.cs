using GymApi.Domain.Entities;
using GymApi.Domain.Enums;

namespace GymApi.Application.Features.Plans.Dtos;

public record ClientPlanResponse(
    Guid Id,
    Guid ClientId,
    string ClientName,
    Guid PlanId,
    string PlanName,
    decimal ReferencePrice,
    int DurationDays,
    DateOnly StartDate,
    DateOnly EndDate,
    PlanStatus Status,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt)
{
    public static ClientPlanResponse From(
        ClientPlan clientPlan,
        Client client,
        Plan plan,
        DateOnly today)
    {
        var status = clientPlan.Status == PlanStatus.Cancelled
            ? PlanStatus.Cancelled
            : clientPlan.EndDate < today
                ? PlanStatus.Expired
                : PlanStatus.Active;

        return new(
            clientPlan.Id,
            clientPlan.ClientId,
            $"{client.FirstName} {client.LastName}".Trim(),
            clientPlan.PlanId,
            plan.Name,
            plan.ReferencePrice,
            plan.DurationDays,
            clientPlan.StartDate,
            clientPlan.EndDate,
            status,
            clientPlan.IsActive,
            clientPlan.CreatedAt,
            clientPlan.UpdatedAt);
    }
}
