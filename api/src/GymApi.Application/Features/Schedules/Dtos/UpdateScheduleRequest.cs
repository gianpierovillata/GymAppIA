using GymApi.Domain.Enums;

namespace GymApi.Application.Features.Schedules.Dtos;

public record UpdateScheduleRequest(
    Guid ClassActivityId,
    Guid TrainerId,
    WeekDay DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string? Room);
