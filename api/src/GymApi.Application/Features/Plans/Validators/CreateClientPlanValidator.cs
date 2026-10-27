using FluentValidation;
using GymApi.Application.Features.Plans.Dtos;

namespace GymApi.Application.Features.Plans.Validators;

public class CreateClientPlanValidator : AbstractValidator<CreateClientPlanRequest>
{
    public CreateClientPlanValidator()
    {
        RuleFor(x => x.PlanId)
            .NotEmpty().WithMessage("El plan es obligatorio.");

        RuleFor(x => x.StartDate)
            .Must(date => date != default).WithMessage("La fecha de inicio es obligatoria.");

        RuleFor(x => x.EndDate)
            .Must((request, endDate) => !endDate.HasValue || endDate.Value > request.StartDate)
            .WithMessage("La fecha de fin debe ser posterior a la fecha de inicio.");
    }
}
