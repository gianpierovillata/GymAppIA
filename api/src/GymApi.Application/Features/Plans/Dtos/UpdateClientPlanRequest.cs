using GymApi.Domain.Enums;

namespace GymApi.Application.Features.Plans.Dtos;

public record UpdateClientPlanRequest(
    Guid PlanId,
    DateOnly StartDate,
    DateOnly EndDate,
    PlanStatus Status);
