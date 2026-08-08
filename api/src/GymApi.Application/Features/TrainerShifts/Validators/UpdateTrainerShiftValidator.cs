using FluentValidation;
using GymApi.Application.Features.TrainerShifts.Dtos;

namespace GymApi.Application.Features.TrainerShifts.Validators;

public class UpdateTrainerShiftValidator : AbstractValidator<UpdateTrainerShiftRequest>
{
    public UpdateTrainerShiftValidator()
    {
        RuleFor(x => x.TrainerId)
            .NotEmpty().WithMessage("El entrenador es obligatorio.");

        RuleFor(x => x.DayOfWeek)
            .IsInEnum().WithMessage("El día de la semana no es válido.");

        RuleFor(x => x.StartTime)
            .NotEmpty().WithMessage("La hora de inicio es obligatoria.");

        RuleFor(x => x.EndTime)
            .GreaterThan(x => x.StartTime)
            .WithMessage("La hora de fin debe ser posterior a la de inicio.");
    }
}
