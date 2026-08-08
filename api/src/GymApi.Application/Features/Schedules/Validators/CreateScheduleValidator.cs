using FluentValidation;
using GymApi.Application.Features.Schedules.Dtos;

namespace GymApi.Application.Features.Schedules.Validators;

public class CreateScheduleValidator : AbstractValidator<CreateScheduleRequest>
{
    public CreateScheduleValidator()
    {
        RuleFor(x => x.ClassActivityId)
            .NotEmpty().WithMessage("La clase es obligatoria.");

        RuleFor(x => x.TrainerId)
            .NotEmpty().WithMessage("El entrenador es obligatorio.");

        RuleFor(x => x.DayOfWeek)
            .IsInEnum().WithMessage("El día de la semana no es válido.");

        RuleFor(x => x.StartTime)
            .NotEmpty().WithMessage("La hora de inicio es obligatoria.");

        RuleFor(x => x.EndTime)
            .GreaterThan(x => x.StartTime)
            .WithMessage("La hora de fin debe ser posterior a la de inicio.");

        RuleFor(x => x.Room)
            .MaximumLength(100).WithMessage("El salón no puede superar 100 caracteres.");
    }
}
