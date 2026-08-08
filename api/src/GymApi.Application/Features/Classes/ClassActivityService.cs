using FluentValidation;
using GymApi.Application.Abstractions;
using GymApi.Application.Features.Classes.Dtos;
using GymApi.Domain.Entities;

namespace GymApi.Application.Features.Classes;

public class ClassActivityService
{
    private const string ListCacheKey = "classes:all";

    private static readonly TimeSpan CacheExpiration = TimeSpan.FromMinutes(5);

    private readonly IGenericRepository<ClassActivity> _classes;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cache;
    private readonly IValidator<CreateClassActivityRequest> _createValidator;
    private readonly IValidator<UpdateClassActivityRequest> _updateValidator;

    public ClassActivityService(
        IGenericRepository<ClassActivity> classes,
        IUnitOfWork unitOfWork,
        ICacheService cache,
        IValidator<CreateClassActivityRequest> createValidator,
        IValidator<UpdateClassActivityRequest> updateValidator)
    {
        _classes = classes;
        _unitOfWork = unitOfWork;
        _cache = cache;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<IReadOnlyList<ClassActivityResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _cache.GetOrSetAsync(
            ListCacheKey,
            async ct =>
            {
                var all = await _classes.GetAllAsync(ct);
                return all.Select(ClassActivityResponse.From).ToList();
            },
            CacheExpiration,
            cancellationToken);
    }

    public async Task<ClassActivityResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var response = await _cache.GetOrSetAsync(
            ClassCacheKey(id),
            async ct =>
            {
                var classActivity = await _classes.GetByIdAsync(id, ct);
                return classActivity is null ? null : ClassActivityResponse.From(classActivity);
            },
            CacheExpiration,
            cancellationToken);

        if (response is null)
        {
            throw new KeyNotFoundException($"La clase con id {id} no existe.");
        }

        return response;
    }

    public async Task<ClassActivityResponse> CreateAsync(CreateClassActivityRequest request, CancellationToken cancellationToken = default)
    {
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);
        await EnsureNameIsAvailableAsync(request.Name, null, cancellationToken);

        var classActivity = new ClassActivity
        {
            Name = request.Name.Trim(),
            Category = request.Category,
            Description = request.Description,
            DurationMinutes = request.DurationMinutes,
            Capacity = request.Capacity,
        };

        await _classes.AddAsync(classActivity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(classActivity.Id, cancellationToken);

        return ClassActivityResponse.From(classActivity);
    }

    public async Task<ClassActivityResponse> UpdateAsync(Guid id, UpdateClassActivityRequest request, CancellationToken cancellationToken = default)
    {
        var classActivity = await _classes.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"La clase con id {id} no existe.");

        await _updateValidator.ValidateAndThrowAsync(request, cancellationToken);
        await EnsureNameIsAvailableAsync(request.Name, id, cancellationToken);

        classActivity.Name = request.Name.Trim();
        classActivity.Category = request.Category;
        classActivity.Description = request.Description;
        classActivity.DurationMinutes = request.DurationMinutes;
        classActivity.Capacity = request.Capacity;

        _classes.Update(classActivity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(classActivity.Id, cancellationToken);

        return ClassActivityResponse.From(classActivity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var classActivity = await _classes.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"La clase con id {id} no existe.");

        classActivity.IsActive = false;

        _classes.Update(classActivity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(classActivity.Id, cancellationToken);
    }

    private async Task EnsureNameIsAvailableAsync(string name, Guid? currentId, CancellationToken cancellationToken)
    {
        var normalized = name.Trim().ToLowerInvariant();

        var existing = await _classes.FindAsync(
            c => c.Name.ToLower() == normalized && c.Id != currentId,
            cancellationToken);

        if (existing.Count > 0)
        {
            throw new ValidationException("Ya existe una clase con ese nombre.");
        }
    }

    private static string ClassCacheKey(Guid id) => $"classes:{id}";

    private async Task InvalidateAsync(Guid id, CancellationToken cancellationToken)
    {
        await _cache.RemoveAsync(ListCacheKey, cancellationToken);
        await _cache.RemoveAsync(ClassCacheKey(id), cancellationToken);
    }
}
