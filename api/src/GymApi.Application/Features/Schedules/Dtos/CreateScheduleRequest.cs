using GymApi.Domain.Enums;

namespace GymApi.Application.Features.Schedules.Dtos;

public record CreateScheduleRequest(
    Guid ClassActivityId,
    Guid TrainerId,
    WeekDay DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string? Room);
