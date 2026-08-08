using FluentValidation;
using GymApi.Application.Features.Trainers.Dtos;

namespace GymApi.Application.Features.Trainers.Validators;

public class UpdateTrainerValidator : AbstractValidator<UpdateTrainerRequest>
{
    public UpdateTrainerValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("El nombre es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre no puede superar 100 caracteres.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("El apellido es obligatorio.")
            .MaximumLength(100).WithMessage("El apellido no puede superar 100 caracteres.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El email es obligatorio.")
            .EmailAddress().WithMessage("El email no tiene un formato válido.")
            .MaximumLength(150).WithMessage("El email no puede superar 150 caracteres.");

        RuleFor(x => x.Phone)
            .MaximumLength(30).WithMessage("El teléfono no puede superar 30 caracteres.");

        RuleFor(x => x.Specialty)
            .MaximumLength(100).WithMessage("La especialidad no puede superar 100 caracteres.");
    }
}
