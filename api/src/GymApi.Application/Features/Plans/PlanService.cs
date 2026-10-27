using FluentValidation;
using GymApi.Application.Abstractions;
using GymApi.Application.Features.Plans.Dtos;
using GymApi.Domain.Entities;

namespace GymApi.Application.Features.Plans;

public class PlanService
{
    private const string ListCacheKey = "plans:all";

    private const string AssignmentsCacheKey = "clientplans:all";

    private static readonly TimeSpan CacheExpiration = TimeSpan.FromMinutes(5);

    private readonly IGenericRepository<Plan> _plans;
    private readonly IGenericRepository<ClientPlan> _clientPlans;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cache;
    private readonly IValidator<CreatePlanRequest> _createValidator;
    private readonly IValidator<UpdatePlanRequest> _updateValidator;

    public PlanService(
        IGenericRepository<Plan> plans,
        IGenericRepository<ClientPlan> clientPlans,
        IUnitOfWork unitOfWork,
        ICacheService cache,
        IValidator<CreatePlanRequest> createValidator,
        IValidator<UpdatePlanRequest> updateValidator)
    {
        _plans = plans;
        _clientPlans = clientPlans;
        _unitOfWork = unitOfWork;
        _cache = cache;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<IReadOnlyList<PlanResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _cache.GetOrSetAsync(
            ListCacheKey,
            async ct =>
            {
                var plans = await _plans.GetAllAsync(ct);
                return plans
                    .OrderBy(p => p.Name)
                    .Select(PlanResponse.From)
                    .ToList();
            },
            CacheExpiration,
            cancellationToken);
    }

    public async Task<PlanResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var response = await _cache.GetOrSetAsync(
            PlanCacheKey(id),
            async ct =>
            {
                var plan = await _plans.GetByIdAsync(id, ct);
                return plan is null ? null : PlanResponse.From(plan);
            },
            CacheExpiration,
            cancellationToken);

        if (response is null)
        {
            throw new KeyNotFoundException($"El plan con id {id} no existe.");
        }

        return response;
    }

    public async Task<PlanResponse> CreateAsync(CreatePlanRequest request, CancellationToken cancellationToken = default)
    {
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);
        await EnsureNameIsAvailableAsync(request.Name, null, cancellationToken);

        var plan = new Plan
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            ReferencePrice = request.ReferencePrice,
            DurationDays = request.DurationDays,
        };

        await _plans.AddAsync(plan, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(plan.Id, cancellationToken);

        return PlanResponse.From(plan);
    }

    public async Task<PlanResponse> UpdateAsync(
        Guid id,
        UpdatePlanRequest request,
        CancellationToken cancellationToken = default)
    {
        var plan = await _plans.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"El plan con id {id} no existe.");

        await _updateValidator.ValidateAndThrowAsync(request, cancellationToken);
        await EnsureNameIsAvailableAsync(request.Name, id, cancellationToken);

        plan.Name = request.Name.Trim();
        plan.Description = request.Description?.Trim();
        plan.ReferencePrice = request.ReferencePrice;
        plan.DurationDays = request.DurationDays;

        _plans.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(plan.Id, cancellationToken);

        return PlanResponse.From(plan);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var plan = await _plans.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"El plan con id {id} no existe.");

        var activeAssignments = await _clientPlans.FindAsync(
            cp => cp.PlanId == id && cp.IsActive,
            cancellationToken);

        if (activeAssignments.Count > 0)
        {
            throw new ValidationException(
                "No se puede eliminar un plan con asignaciones activas. Cancelá o eliminá esas asignaciones primero.");
        }

        plan.IsActive = false;

        _plans.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(plan.Id, cancellationToken);
    }

    private async Task EnsureNameIsAvailableAsync(
        string name,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var normalized = name.Trim().ToLowerInvariant();

        var existing = await _plans.FindAsync(
            p => p.Name.ToLower() == normalized,
            cancellationToken);

        if (existing.Any(p => p.Id != currentId))
        {
            throw new ValidationException("Ya existe un plan con ese nombre.");
        }
    }

    private static string PlanCacheKey(Guid id) => $"plans:{id}";

    private static string ClientPlansCacheKey(Guid clientId) => $"clients:{clientId}:plans";

    private async Task InvalidateAsync(Guid planId, CancellationToken cancellationToken)
    {
        await _cache.RemoveAsync(ListCacheKey, cancellationToken);
        await _cache.RemoveAsync(PlanCacheKey(planId), cancellationToken);
        await _cache.RemoveAsync(AssignmentsCacheKey, cancellationToken);

        var assignments = await _clientPlans.FindAsync(
            cp => cp.PlanId == planId,
            cancellationToken);

        foreach (var clientId in assignments.Select(cp => cp.ClientId).Distinct())
        {
            await _cache.RemoveAsync(ClientPlansCacheKey(clientId), cancellationToken);
        }
    }
}
