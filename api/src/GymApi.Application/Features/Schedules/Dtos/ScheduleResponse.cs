using GymApi.Domain.Entities;
using GymApi.Domain.Enums;

namespace GymApi.Application.Features.Schedules.Dtos;

public record ScheduleResponse(
    Guid Id,
    Guid ClassActivityId,
    string ClassActivityName,
    Guid TrainerId,
    string TrainerName,
    WeekDay DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string? Room,
    bool IsActive)
{
    public static ScheduleResponse From(Schedule schedule, ClassActivity classActivity, Trainer trainer) =>
        new(
            schedule.Id,
            schedule.ClassActivityId,
            classActivity.Name,
            schedule.TrainerId,
            $"{trainer.FirstName} {trainer.LastName}",
            schedule.DayOfWeek,
            schedule.StartTime,
            schedule.EndTime,
            schedule.Room,
            schedule.IsActive);
}
