using FluentValidation;
using GymApi.Application.Abstractions;
using GymApi.Application.Features.Clients.Dtos;
using GymApi.Application.Features.Trainers.Dtos;
using GymApi.Domain.Entities;

namespace GymApi.Application.Features.Trainers;

public class TrainerService
{
    private const string ListCacheKey = "trainers:all";

    private static readonly TimeSpan CacheExpiration = TimeSpan.FromMinutes(5);

    private readonly IGenericRepository<Trainer> _trainers;
    private readonly IGenericRepository<Client> _clients;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cache;
    private readonly IValidator<CreateTrainerRequest> _createValidator;
    private readonly IValidator<UpdateTrainerRequest> _updateValidator;

    public TrainerService(
        IGenericRepository<Trainer> trainers,
        IGenericRepository<Client> clients,
        IUnitOfWork unitOfWork,
        ICacheService cache,
        IValidator<CreateTrainerRequest> createValidator,
        IValidator<UpdateTrainerRequest> updateValidator)
    {
        _trainers = trainers;
        _clients = clients;
        _unitOfWork = unitOfWork;
        _cache = cache;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<IReadOnlyList<TrainerResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _cache.GetOrSetAsync(
            ListCacheKey,
            async ct =>
            {
                var all = await _trainers.GetAllAsync(ct);
                return all.Select(TrainerResponse.From).ToList();
            },
            CacheExpiration,
            cancellationToken);
    }

    public async Task<TrainerResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var response = await _cache.GetOrSetAsync(
            TrainerCacheKey(id),
            async ct =>
            {
                var trainer = await _trainers.GetByIdAsync(id, ct);
                return trainer is null ? null : TrainerResponse.From(trainer);
            },
            CacheExpiration,
            cancellationToken);

        if (response is null)
        {
            throw new KeyNotFoundException($"El entrenador con id {id} no existe.");
        }

        return response;
    }

    public async Task<TrainerResponse> CreateAsync(CreateTrainerRequest request, CancellationToken cancellationToken = default)
    {
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);
        await EnsureEmailIsAvailableAsync(request.Email, null, cancellationToken);

        var trainer = new Trainer
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Phone = request.Phone,
            Specialty = request.Specialty,
        };

        await _trainers.AddAsync(trainer, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(trainer.Id, cancellationToken);

        return TrainerResponse.From(trainer);
    }

    public async Task<TrainerResponse> UpdateAsync(Guid id, UpdateTrainerRequest request, CancellationToken cancellationToken = default)
    {
        var trainer = await _trainers.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"El entrenador con id {id} no existe.");

        await _updateValidator.ValidateAndThrowAsync(request, cancellationToken);
        await EnsureEmailIsAvailableAsync(request.Email, id, cancellationToken);

        trainer.FirstName = request.FirstName.Trim();
        trainer.LastName = request.LastName.Trim();
        trainer.Email = request.Email.Trim().ToLowerInvariant();
        trainer.Phone = request.Phone;
        trainer.Specialty = request.Specialty;

        _trainers.Update(trainer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(trainer.Id, cancellationToken);

        return TrainerResponse.From(trainer);
    }

    public async Task<IReadOnlyList<ClientResponse>> GetClientsAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var trainer = await _trainers.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"El entrenador con id {id} no existe.");

        var clients = await _clients.FindAsync(
            c => c.TrainerId == trainer.Id && c.IsActive,
            cancellationToken);

        return clients.Select(c => ClientResponse.From(c)).ToList();
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var trainer = await _trainers.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"El entrenador con id {id} no existe.");

        trainer.IsActive = false;

        _trainers.Update(trainer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(trainer.Id, cancellationToken);
    }

    private async Task EnsureEmailIsAvailableAsync(string email, Guid? currentId, CancellationToken cancellationToken)
    {
        var normalized = email.Trim().ToLowerInvariant();

        var existing = await _trainers.FindAsync(
            t => t.Email == normalized && t.Id != currentId,
            cancellationToken);

        if (existing.Count > 0)
        {
            throw new ValidationException("Ya existe un entrenador con ese email.");
        }
    }

    private static string TrainerCacheKey(Guid id) => $"trainers:{id}";

    private async Task InvalidateAsync(Guid id, CancellationToken cancellationToken)
    {
        await _cache.RemoveAsync(ListCacheKey, cancellationToken);
        await _cache.RemoveAsync(TrainerCacheKey(id), cancellationToken);
    }
}
