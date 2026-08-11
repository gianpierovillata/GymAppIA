using FluentValidation;
using GymApi.Application.Abstractions;
using GymApi.Application.Features.Clients.Dtos;
using GymApi.Domain.Entities;

namespace GymApi.Application.Features.Clients;

public class ClientService
{
    private const string ListCacheKey = "clients:all";

    private static readonly TimeSpan CacheExpiration = TimeSpan.FromMinutes(5);

    private readonly IGenericRepository<Client> _clients;
    private readonly IGenericRepository<Trainer> _trainers;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cache;
    private readonly IValidator<CreateClientRequest> _createValidator;
    private readonly IValidator<UpdateClientRequest> _updateValidator;

    public ClientService(
        IGenericRepository<Client> clients,
        IGenericRepository<Trainer> trainers,
        IUnitOfWork unitOfWork,
        ICacheService cache,
        IValidator<CreateClientRequest> createValidator,
        IValidator<UpdateClientRequest> updateValidator)
    {
        _clients = clients;
        _trainers = trainers;
        _unitOfWork = unitOfWork;
        _cache = cache;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<IReadOnlyList<ClientResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var clients = await _cache.GetOrSetAsync(
            ListCacheKey,
            async ct =>
            {
                var all = await _clients.GetAllAsync(ct);
                var trainerNames = await GetTrainerNamesAsync(ct);
                return all
                    .Select(c => ClientResponse.From(c, ResolveTrainerName(trainerNames, c.TrainerId)))
                    .ToList();
            },
            CacheExpiration,
            cancellationToken);

        return clients;
    }

    public async Task<ClientResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var key = ClientCacheKey(id);

        var response = await _cache.GetOrSetAsync(
            key,
            async ct =>
            {
                var client = await _clients.GetByIdAsync(id, ct);
                if (client is null)
                {
                    return null;
                }

                var trainerName = client.TrainerId is null
                    ? null
                    : await GetTrainerNameAsync(client.TrainerId.Value, ct);

                return ClientResponse.From(client, trainerName);
            },
            CacheExpiration,
            cancellationToken);

        if (response is null)
        {
            throw new KeyNotFoundException($"El cliente con id {id} no existe.");
        }

        return response;
    }

    public async Task<ClientResponse> CreateAsync(CreateClientRequest request, CancellationToken cancellationToken = default)
    {
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);
        await EnsureEmailIsAvailableAsync(request.Email, null, cancellationToken);

        var client = new Client
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Phone = request.Phone,
            BirthDate = request.BirthDate,
            Address = request.Address,
        };

        await _clients.AddAsync(client, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(client.Id, cancellationToken);

        return ClientResponse.From(client);
    }

    public async Task<ClientResponse> UpdateAsync(Guid id, UpdateClientRequest request, CancellationToken cancellationToken = default)
    {
        var client = await _clients.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"El cliente con id {id} no existe.");

        await _updateValidator.ValidateAndThrowAsync(request, cancellationToken);
        await EnsureEmailIsAvailableAsync(request.Email, id, cancellationToken);

        client.FirstName = request.FirstName.Trim();
        client.LastName = request.LastName.Trim();
        client.Email = request.Email.Trim().ToLowerInvariant();
        client.Phone = request.Phone;
        client.BirthDate = request.BirthDate;
        client.Address = request.Address;

        _clients.Update(client);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(client.Id, cancellationToken);

        return ClientResponse.From(client);
    }

    public async Task<ClientResponse> AssignPersonalTrainerAsync(
        Guid id,
        AssignPersonalTrainerRequest request,
        CancellationToken cancellationToken = default)
    {
        var client = await _clients.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"El cliente con id {id} no existe.");

        if (request.TrainerId is Guid trainerId)
        {
            var trainer = await _trainers.GetByIdAsync(trainerId, cancellationToken)
                ?? throw new KeyNotFoundException($"El entrenador con id {trainerId} no existe.");

            if (!trainer.IsActive)
            {
                throw new ValidationException("No se puede asignar un entrenador inactivo.");
            }

            client.TrainerId = trainerId;
        }
        else
        {
            client.TrainerId = null;
        }

        _clients.Update(client);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(client.Id, cancellationToken);

        var trainerName = client.TrainerId is null
            ? null
            : await GetTrainerNameAsync(client.TrainerId.Value, cancellationToken);

        return ClientResponse.From(client, trainerName);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var client = await _clients.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"El cliente con id {id} no existe.");

        client.IsActive = false;

        _clients.Update(client);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(client.Id, cancellationToken);
    }

    private async Task<IDictionary<Guid, string>> GetTrainerNamesAsync(CancellationToken cancellationToken)
    {
        var trainers = await _trainers.FindAsync(t => t.IsActive, cancellationToken);
        return trainers.ToDictionary(t => t.Id, t => $"{t.FirstName} {t.LastName}");
    }

    private static string? ResolveTrainerName(IDictionary<Guid, string> names, Guid? trainerId)
        => trainerId is Guid id && names.TryGetValue(id, out var name) ? name : null;

    private async Task<string?> GetTrainerNameAsync(Guid trainerId, CancellationToken cancellationToken)
    {
        var trainer = await _trainers.GetByIdAsync(trainerId, cancellationToken);
        return trainer is null ? null : $"{trainer.FirstName} {trainer.LastName}";
    }

    private async Task EnsureEmailIsAvailableAsync(string email, Guid? currentId, CancellationToken cancellationToken)
    {
        var normalized = email.Trim().ToLowerInvariant();

        var existing = await _clients.FindAsync(
            c => c.Email == normalized && c.Id != currentId,
            cancellationToken);

        if (existing.Count > 0)
        {
            throw new ValidationException("Ya existe un cliente con ese email.");
        }
    }

    private static string ClientCacheKey(Guid id) => $"clients:{id}";

    private async Task InvalidateAsync(Guid id, CancellationToken cancellationToken)
    {
        await _cache.RemoveAsync(ListCacheKey, cancellationToken);
        await _cache.RemoveAsync(ClientCacheKey(id), cancellationToken);
    }
}
