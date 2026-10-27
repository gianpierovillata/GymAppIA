namespace GymApi.Application.Features.Plans.Dtos;

public record CreateClientPlanRequest(
    Guid PlanId,
    DateOnly StartDate,
    DateOnly? EndDate);
