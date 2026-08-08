using FluentValidation;
using GymApi.Application.Abstractions;
using GymApi.Application.Features.TrainerShifts.Dtos;
using GymApi.Domain.Entities;
using GymApi.Domain.Enums;

namespace GymApi.Application.Features.TrainerShifts;

public class TrainerShiftService
{
    private const string ListCacheKey = "trainershifts:all";

    private static readonly TimeSpan CacheExpiration = TimeSpan.FromMinutes(5);

    private readonly IGenericRepository<TrainerShift> _shifts;
    private readonly IGenericRepository<Trainer> _trainers;
    private readonly IGenericRepository<Schedule> _schedules;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cache;
    private readonly IValidator<CreateTrainerShiftRequest> _createValidator;
    private readonly IValidator<UpdateTrainerShiftRequest> _updateValidator;

    public TrainerShiftService(
        IGenericRepository<TrainerShift> shifts,
        IGenericRepository<Trainer> trainers,
        IGenericRepository<Schedule> schedules,
        IUnitOfWork unitOfWork,
        ICacheService cache,
        IValidator<CreateTrainerShiftRequest> createValidator,
        IValidator<UpdateTrainerShiftRequest> updateValidator)
    {
        _shifts = shifts;
        _trainers = trainers;
        _schedules = schedules;
        _unitOfWork = unitOfWork;
        _cache = cache;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<IReadOnlyList<TrainerShiftResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _cache.GetOrSetAsync(
            ListCacheKey,
            async ct =>
            {
                var shifts = await _shifts.GetAllAsync(ct);
                return await BuildResponsesAsync(shifts, ct);
            },
            CacheExpiration,
            cancellationToken);
    }

    public async Task<TrainerShiftResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var response = await _cache.GetOrSetAsync(
            ShiftCacheKey(id),
            async ct =>
            {
                var shift = await _shifts.GetByIdAsync(id, ct);

                if (shift is null)
                {
                    return null;
                }

                return (await BuildResponsesAsync([shift], ct)).First();
            },
            CacheExpiration,
            cancellationToken);

        if (response is null)
        {
            throw new KeyNotFoundException($"El turno con id {id} no existe.");
        }

        return response;
    }

    public async Task<TrainerShiftResponse> CreateAsync(CreateTrainerShiftRequest request, CancellationToken cancellationToken = default)
    {
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);
        var trainer = await EnsureTrainerExistsAsync(request.TrainerId, cancellationToken);
        await EnsureNoConflictAsync(request.TrainerId, request.DayOfWeek, request.StartTime, request.EndTime, null, cancellationToken);

        var shift = new TrainerShift
        {
            TrainerId = request.TrainerId,
            DayOfWeek = request.DayOfWeek,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
        };

        await _shifts.AddAsync(shift, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(shift.Id, cancellationToken);

        return TrainerShiftResponse.From(shift, trainer);
    }

    public async Task<TrainerShiftResponse> UpdateAsync(Guid id, UpdateTrainerShiftRequest request, CancellationToken cancellationToken = default)
    {
        var shift = await _shifts.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"El turno con id {id} no existe.");

        await _updateValidator.ValidateAndThrowAsync(request, cancellationToken);
        var trainer = await EnsureTrainerExistsAsync(request.TrainerId, cancellationToken);
        await EnsureNoConflictAsync(request.TrainerId, request.DayOfWeek, request.StartTime, request.EndTime, id, cancellationToken);

        shift.TrainerId = request.TrainerId;
        shift.DayOfWeek = request.DayOfWeek;
        shift.StartTime = request.StartTime;
        shift.EndTime = request.EndTime;

        _shifts.Update(shift);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(shift.Id, cancellationToken);

        return TrainerShiftResponse.From(shift, trainer);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var shift = await _shifts.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"El turno con id {id} no existe.");

        shift.IsActive = false;

        _shifts.Update(shift);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(shift.Id, cancellationToken);
    }

    private async Task<Trainer> EnsureTrainerExistsAsync(Guid trainerId, CancellationToken cancellationToken)
    {
        var trainer = await _trainers.GetByIdAsync(trainerId, cancellationToken)
            ?? throw new KeyNotFoundException($"El entrenador con id {trainerId} no existe.");

        if (!trainer.IsActive)
        {
            throw new ValidationException("No se puede asignar un turno a un entrenador inactivo.");
        }

        return trainer;
    }

    private async Task EnsureNoConflictAsync(
        Guid trainerId,
        WeekDay dayOfWeek,
        TimeOnly startTime,
        TimeOnly endTime,
        Guid? excludeShiftId,
        CancellationToken cancellationToken)
    {
        var otherShifts = await _shifts.FindAsync(
            s => s.TrainerId == trainerId
                 && s.DayOfWeek == dayOfWeek
                 && s.IsActive,
            cancellationToken);

        foreach (var shift in otherShifts)
        {
            if (shift.Id == excludeShiftId)
            {
                continue;
            }

            if (shift.StartTime < endTime && shift.EndTime > startTime)
            {
                throw new ValidationException(
                    $"El entrenador ya tiene un turno asignado de {shift.StartTime:HH\\:mm} a {shift.EndTime:HH\\:mm} ese día.");
            }
        }

        var assignedSchedules = await _schedules.FindAsync(
            s => s.TrainerId == trainerId
                 && s.DayOfWeek == dayOfWeek
                 && s.IsActive,
            cancellationToken);

        foreach (var schedule in assignedSchedules)
        {
            if (schedule.StartTime < endTime && schedule.EndTime > startTime)
            {
                throw new ValidationException(
                    $"El entrenador tiene una clase asignada de {schedule.StartTime:HH\\:mm} a {schedule.EndTime:HH\\:mm} ese día.");
            }
        }
    }

    private async Task<IReadOnlyList<TrainerShiftResponse>> BuildResponsesAsync(
        IEnumerable<TrainerShift> shifts,
        CancellationToken cancellationToken)
    {
        var shiftList = shifts.ToList();

        var trainerIds = shiftList.Select(s => s.TrainerId).Distinct().ToList();

        var trainers = (await _trainers.FindAsync(t => trainerIds.Contains(t.Id), cancellationToken))
            .ToDictionary(t => t.Id);

        return shiftList
            .Where(s => trainers.ContainsKey(s.TrainerId))
            .Select(s => TrainerShiftResponse.From(s, trainers[s.TrainerId]))
            .ToList();
    }

    private static string ShiftCacheKey(Guid id) => $"trainershifts:{id}";

    private async Task InvalidateAsync(Guid id, CancellationToken cancellationToken)
    {
        await _cache.RemoveAsync(ListCacheKey, cancellationToken);
        await _cache.RemoveAsync(ShiftCacheKey(id), cancellationToken);
    }
}
