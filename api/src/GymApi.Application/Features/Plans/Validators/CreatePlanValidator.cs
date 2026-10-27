using FluentValidation;
using GymApi.Application.Features.Plans.Dtos;

namespace GymApi.Application.Features.Plans.Validators;

public class CreatePlanValidator : AbstractValidator<CreatePlanRequest>
{
    public CreatePlanValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre no puede superar 100 caracteres.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("La descripción no puede superar 500 caracteres.");

        RuleFor(x => x.ReferencePrice)
            .GreaterThanOrEqualTo(0).WithMessage("El precio de referencia no puede ser negativo.");

        RuleFor(x => x.DurationDays)
            .GreaterThan(0).WithMessage("La duración debe ser mayor a 0 días.")
            .LessThanOrEqualTo(3650).WithMessage("La duración no puede superar 3650 días.");
    }
}
