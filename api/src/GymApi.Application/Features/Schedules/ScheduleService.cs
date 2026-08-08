using FluentValidation;
using GymApi.Application.Abstractions;
using GymApi.Application.Features.Schedules.Dtos;
using GymApi.Domain.Entities;
using GymApi.Domain.Enums;

namespace GymApi.Application.Features.Schedules;

public class ScheduleService
{
    private const string ListCacheKey = "schedules:all";

    private static readonly TimeSpan CacheExpiration = TimeSpan.FromMinutes(5);

    private readonly IGenericRepository<Schedule> _schedules;
    private readonly IGenericRepository<ClassActivity> _classes;
    private readonly IGenericRepository<Trainer> _trainers;
    private readonly IGenericRepository<TrainerShift> _shifts;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cache;
    private readonly IValidator<CreateScheduleRequest> _createValidator;
    private readonly IValidator<UpdateScheduleRequest> _updateValidator;

    public ScheduleService(
        IGenericRepository<Schedule> schedules,
        IGenericRepository<ClassActivity> classes,
        IGenericRepository<Trainer> trainers,
        IGenericRepository<TrainerShift> shifts,
        IUnitOfWork unitOfWork,
        ICacheService cache,
        IValidator<CreateScheduleRequest> createValidator,
        IValidator<UpdateScheduleRequest> updateValidator)
    {
        _schedules = schedules;
        _classes = classes;
        _trainers = trainers;
        _shifts = shifts;
        _unitOfWork = unitOfWork;
        _cache = cache;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<IReadOnlyList<ScheduleResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _cache.GetOrSetAsync(
            ListCacheKey,
            async ct =>
            {
                var schedules = await _schedules.GetAllAsync(ct);
                return await BuildResponsesAsync(schedules, ct);
            },
            CacheExpiration,
            cancellationToken);
    }

    public async Task<ScheduleResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var response = await _cache.GetOrSetAsync(
            ScheduleCacheKey(id),
            async ct =>
            {
                var schedule = await _schedules.GetByIdAsync(id, ct);

                if (schedule is null)
                {
                    return null;
                }

                return (await BuildResponsesAsync([schedule], ct)).First();
            },
            CacheExpiration,
            cancellationToken);

        if (response is null)
        {
            throw new KeyNotFoundException($"El horario con id {id} no existe.");
        }

        return response;
    }

    public async Task<ScheduleResponse> CreateAsync(CreateScheduleRequest request, CancellationToken cancellationToken = default)
    {
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);
        await EnsureReferencesExistAsync(request.ClassActivityId, request.TrainerId, cancellationToken);
        await EnsureNoConflictAsync(request.TrainerId, request.DayOfWeek, request.StartTime, request.EndTime, null, cancellationToken);

        var schedule = new Schedule
        {
            ClassActivityId = request.ClassActivityId,
            TrainerId = request.TrainerId,
            DayOfWeek = request.DayOfWeek,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Room = request.Room,
        };

        await _schedules.AddAsync(schedule, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(schedule.Id, cancellationToken);

        return (await BuildResponsesAsync([schedule], cancellationToken)).First();
    }

    public async Task<ScheduleResponse> UpdateAsync(Guid id, UpdateScheduleRequest request, CancellationToken cancellationToken = default)
    {
        var schedule = await _schedules.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"El horario con id {id} no existe.");

        await _updateValidator.ValidateAndThrowAsync(request, cancellationToken);
        await EnsureReferencesExistAsync(request.ClassActivityId, request.TrainerId, cancellationToken);
        await EnsureNoConflictAsync(request.TrainerId, request.DayOfWeek, request.StartTime, request.EndTime, id, cancellationToken);

        schedule.ClassActivityId = request.ClassActivityId;
        schedule.TrainerId = request.TrainerId;
        schedule.DayOfWeek = request.DayOfWeek;
        schedule.StartTime = request.StartTime;
        schedule.EndTime = request.EndTime;
        schedule.Room = request.Room;

        _schedules.Update(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(schedule.Id, cancellationToken);

        return (await BuildResponsesAsync([schedule], cancellationToken)).First();
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var schedule = await _schedules.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException($"El horario con id {id} no existe.");

        schedule.IsActive = false;

        _schedules.Update(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(schedule.Id, cancellationToken);
    }

    private async Task EnsureNoConflictAsync(
        Guid trainerId,
        WeekDay dayOfWeek,
        TimeOnly startTime,
        TimeOnly endTime,
        Guid? excludeScheduleId,
        CancellationToken cancellationToken)
    {
        var otherSchedules = await _schedules.FindAsync(
            s => s.TrainerId == trainerId
                 && s.DayOfWeek == dayOfWeek
                 && s.IsActive,
            cancellationToken);

        foreach (var schedule in otherSchedules)
        {
            if (schedule.Id == excludeScheduleId)
            {
                continue;
            }

            if (schedule.StartTime < endTime && schedule.EndTime > startTime)
            {
                throw new ValidationException(
                    $"El entrenador ya tiene una clase asignada de {schedule.StartTime:HH\\:mm} a {schedule.EndTime:HH\\:mm} ese día.");
            }
        }

        var assignedShifts = await _shifts.FindAsync(
            s => s.TrainerId == trainerId
                 && s.DayOfWeek == dayOfWeek
                 && s.IsActive,
            cancellationToken);

        foreach (var shift in assignedShifts)
        {
            if (shift.StartTime < endTime && shift.EndTime > startTime)
            {
                throw new ValidationException(
                    $"El entrenador tiene un turno asignado de {shift.StartTime:HH\\:mm} a {shift.EndTime:HH\\:mm} ese día.");
            }
        }
    }

    private async Task EnsureReferencesExistAsync(Guid classActivityId, Guid trainerId, CancellationToken cancellationToken)
    {
        var classActivity = await _classes.GetByIdAsync(classActivityId, cancellationToken)
            ?? throw new KeyNotFoundException($"La clase con id {classActivityId} no existe.");

        if (!classActivity.IsActive)
        {
            throw new ValidationException("No se puede asignar una clase inactiva.");
        }

        var trainer = await _trainers.GetByIdAsync(trainerId, cancellationToken)
            ?? throw new KeyNotFoundException($"El entrenador con id {trainerId} no existe.");

        if (!trainer.IsActive)
        {
            throw new ValidationException("No se puede asignar un entrenador inactivo.");
        }
    }

    private async Task<IReadOnlyList<ScheduleResponse>> BuildResponsesAsync(
        IEnumerable<Schedule> schedules,
        CancellationToken cancellationToken)
    {
        var scheduleList = schedules.ToList();

        var classIds = scheduleList.Select(s => s.ClassActivityId).Distinct().ToList();
        var trainerIds = scheduleList.Select(s => s.TrainerId).Distinct().ToList();

        var classes = (await _classes.FindAsync(c => classIds.Contains(c.Id), cancellationToken))
            .ToDictionary(c => c.Id);
        var trainers = (await _trainers.FindAsync(t => trainerIds.Contains(t.Id), cancellationToken))
            .ToDictionary(t => t.Id);

        return scheduleList
            .Where(s => classes.ContainsKey(s.ClassActivityId) && trainers.ContainsKey(s.TrainerId))
            .Select(s => ScheduleResponse.From(s, classes[s.ClassActivityId], trainers[s.TrainerId]))
            .ToList();
    }

    private static string ScheduleCacheKey(Guid id) => $"schedules:{id}";

    private async Task InvalidateAsync(Guid id, CancellationToken cancellationToken)
    {
        await _cache.RemoveAsync(ListCacheKey, cancellationToken);
        await _cache.RemoveAsync(ScheduleCacheKey(id), cancellationToken);
    }
}
