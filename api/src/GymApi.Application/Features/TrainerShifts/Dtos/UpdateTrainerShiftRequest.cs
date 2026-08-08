using GymApi.Domain.Enums;

namespace GymApi.Application.Features.TrainerShifts.Dtos;

public record UpdateTrainerShiftRequest(
    Guid TrainerId,
    WeekDay DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime);
