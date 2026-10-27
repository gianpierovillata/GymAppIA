using FluentValidation;
using GymApi.Application.Abstractions;
using GymApi.Application.Features.Plans.Dtos;
using GymApi.Domain.Entities;
using GymApi.Domain.Enums;

namespace GymApi.Application.Features.Plans;

public class ClientPlanService
{
    private const string AllCacheKey = "clientplans:all";

    private static readonly TimeSpan CacheExpiration = TimeSpan.FromMinutes(5);

    private readonly IGenericRepository<ClientPlan> _clientPlans;
    private readonly IGenericRepository<Client> _clients;
    private readonly IGenericRepository<Plan> _plans;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cache;
    private readonly IValidator<CreateClientPlanRequest> _createValidator;
    private readonly IValidator<UpdateClientPlanRequest> _updateValidator;

    public ClientPlanService(
        IGenericRepository<ClientPlan> clientPlans,
        IGenericRepository<Client> clients,
        IGenericRepository<Plan> plans,
        IUnitOfWork unitOfWork,
        ICacheService cache,
        IValidator<CreateClientPlanRequest> createValidator,
        IValidator<UpdateClientPlanRequest> updateValidator)
    {
        _clientPlans = clientPlans;
        _clients = clients;
        _plans = plans;
        _unitOfWork = unitOfWork;
        _cache = cache;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<IReadOnlyList<ClientPlanResponse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await _cache.GetOrSetAsync(
            AllCacheKey,
            async ct =>
            {
                var assignments = await _clientPlans.FindAsync(cp => cp.IsActive, ct);
                return await BuildResponsesAsync(assignments, ct);
            },
            CacheExpiration,
            cancellationToken);
    }

    public async Task<IReadOnlyList<ClientPlanResponse>> GetByClientAsync(
        Guid clientId,
        CancellationToken cancellationToken = default)
    {
        await EnsureClientExistsAsync(clientId, cancellationToken);

        return await _cache.GetOrSetAsync(
            ClientPlansCacheKey(clientId),
            async ct =>
            {
                var assignments = await _clientPlans.FindAsync(
                    cp => cp.ClientId == clientId && cp.IsActive,
                    ct);

                return await BuildResponsesAsync(assignments, ct);
            },
            CacheExpiration,
            cancellationToken);
    }

    public async Task<ClientPlanResponse> CreateAsync(
        Guid clientId,
        CreateClientPlanRequest request,
        CancellationToken cancellationToken = default)
    {
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);

        var client = await GetActiveClientAsync(clientId, cancellationToken);
        var plan = await GetActivePlanAsync(request.PlanId, cancellationToken);

        var endDate = request.EndDate ?? request.StartDate.AddDays(plan.DurationDays);

        var clientPlan = new ClientPlan
        {
            ClientId = clientId,
            PlanId = plan.Id,
            StartDate = request.StartDate,
            EndDate = endDate,
            Status = PlanStatus.Active,
        };

        await _clientPlans.AddAsync(clientPlan, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(clientId, cancellationToken);

        return ClientPlanResponse.From(clientPlan, client, plan, Today());
    }

    public async Task<ClientPlanResponse> UpdateAsync(
        Guid clientId,
        Guid id,
        UpdateClientPlanRequest request,
        CancellationToken cancellationToken = default)
    {
        var clientPlan = await GetForClientAsync(clientId, id, cancellationToken);

        await _updateValidator.ValidateAndThrowAsync(request, cancellationToken);

        var client = await GetActiveClientAsync(clientId, cancellationToken);
        var plan = await GetPlanForUpdateAsync(clientPlan.PlanId, request.PlanId, cancellationToken);

        clientPlan.PlanId = plan.Id;
        clientPlan.StartDate = request.StartDate;
        clientPlan.EndDate = request.EndDate;
        clientPlan.Status = request.Status;

        _clientPlans.Update(clientPlan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(clientId, cancellationToken);

        return ClientPlanResponse.From(clientPlan, client, plan, Today());
    }

    public async Task DeleteAsync(
        Guid clientId,
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var clientPlan = await GetForClientAsync(clientId, id, cancellationToken);

        clientPlan.IsActive = false;

        _clientPlans.Update(clientPlan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(clientId, cancellationToken);
    }

    private async Task<ClientPlan> GetForClientAsync(
        Guid clientId,
        Guid id,
        CancellationToken cancellationToken)
    {
        var clientPlan = await _clientPlans.GetByIdAsync(id, cancellationToken);

        if (clientPlan is null || clientPlan.ClientId != clientId || !clientPlan.IsActive)
        {
            throw new KeyNotFoundException(
                $"La asignación con id {id} no existe para el cliente {clientId}.");
        }

        return clientPlan;
    }

    private async Task<Client> EnsureClientExistsAsync(
        Guid clientId,
        CancellationToken cancellationToken)
    {
        return await _clients.GetByIdAsync(clientId, cancellationToken)
            ?? throw new KeyNotFoundException($"El cliente con id {clientId} no existe.");
    }

    private async Task<Client> GetActiveClientAsync(
        Guid clientId,
        CancellationToken cancellationToken)
    {
        var client = await EnsureClientExistsAsync(clientId, cancellationToken);

        if (!client.IsActive)
        {
            throw new ValidationException("No se puede asignar un plan a un cliente inactivo.");
        }

        return client;
    }

    private async Task<Plan> GetActivePlanAsync(
        Guid planId,
        CancellationToken cancellationToken)
    {
        var plan = await _plans.GetByIdAsync(planId, cancellationToken)
            ?? throw new KeyNotFoundException($"El plan con id {planId} no existe.");

        if (!plan.IsActive)
        {
            throw new ValidationException("No se puede asignar un plan inactivo.");
        }

        return plan;
    }

    private async Task<Plan> GetPlanForUpdateAsync(
        Guid currentPlanId,
        Guid requestedPlanId,
        CancellationToken cancellationToken)
    {
        var plan = await _plans.GetByIdAsync(requestedPlanId, cancellationToken)
            ?? throw new KeyNotFoundException($"El plan con id {requestedPlanId} no existe.");

        if (requestedPlanId != currentPlanId && !plan.IsActive)
        {
            throw new ValidationException("No se puede asignar un plan inactivo.");
        }

        return plan;
    }

    private async Task<IReadOnlyList<ClientPlanResponse>> BuildResponsesAsync(
        IEnumerable<ClientPlan> assignments,
        CancellationToken cancellationToken)
    {
        var assignmentList = assignments.ToList();

        if (assignmentList.Count == 0)
        {
            return [];
        }

        var clientIds = assignmentList.Select(cp => cp.ClientId).Distinct().ToList();
        var planIds = assignmentList.Select(cp => cp.PlanId).Distinct().ToList();

        var clients = (await _clients.FindAsync(c => clientIds.Contains(c.Id), cancellationToken))
            .ToDictionary(c => c.Id);

        var plans = (await _plans.FindAsync(p => planIds.Contains(p.Id), cancellationToken))
            .ToDictionary(p => p.Id);

        var today = Today();

        return assignmentList
            .Where(cp => clients.ContainsKey(cp.ClientId) && plans.ContainsKey(cp.PlanId))
            .OrderByDescending(cp => cp.StartDate)
            .ThenBy(cp => clients[cp.ClientId].LastName)
            .Select(cp => ClientPlanResponse.From(cp, clients[cp.ClientId], plans[cp.PlanId], today))
            .ToList();
    }

    private static DateOnly Today() => DateOnly.FromDateTime(DateTime.UtcNow);

    private static string ClientPlansCacheKey(Guid clientId) => $"clients:{clientId}:plans";

    private async Task InvalidateAsync(Guid clientId, CancellationToken cancellationToken)
    {
        await _cache.RemoveAsync(AllCacheKey, cancellationToken);
        await _cache.RemoveAsync(ClientPlansCacheKey(clientId), cancellationToken);
    }
}
