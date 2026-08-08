using FluentValidation;
using GymApi.Application.Features.Classes.Dtos;

namespace GymApi.Application.Features.Classes.Validators;

public class UpdateClassActivityValidator : AbstractValidator<UpdateClassActivityRequest>
{
    public UpdateClassActivityValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre no puede superar 100 caracteres.");

        RuleFor(x => x.Category)
            .IsInEnum().WithMessage("La categoría no es válida.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("La descripción no puede superar 500 caracteres.");

        RuleFor(x => x.DurationMinutes)
            .GreaterThan(0).WithMessage("La duración debe ser mayor a 0 minutos.");

        RuleFor(x => x.Capacity)
            .GreaterThan(0).WithMessage("La capacidad debe ser mayor a 0.");
    }
}
