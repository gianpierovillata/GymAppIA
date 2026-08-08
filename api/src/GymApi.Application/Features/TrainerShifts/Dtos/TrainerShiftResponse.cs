using GymApi.Domain.Entities;
using GymApi.Domain.Enums;

namespace GymApi.Application.Features.TrainerShifts.Dtos;

public record TrainerShiftResponse(
    Guid Id,
    Guid TrainerId,
    string TrainerName,
    WeekDay DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime,
    bool IsActive)
{
    public static TrainerShiftResponse From(TrainerShift shift, Trainer trainer) =>
        new(
            shift.Id,
            shift.TrainerId,
            $"{trainer.FirstName} {trainer.LastName}",
            shift.DayOfWeek,
            shift.StartTime,
            shift.EndTime,
            shift.IsActive);
}
