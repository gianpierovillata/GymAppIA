using FluentValidation;
using GymApi.Application.Features.Plans.Dtos;
using GymApi.Domain.Enums;

namespace GymApi.Application.Features.Plans.Validators;

public class UpdateClientPlanValidator : AbstractValidator<UpdateClientPlanRequest>
{
    public UpdateClientPlanValidator()
    {
        RuleFor(x => x.PlanId)
            .NotEmpty().WithMessage("El plan es obligatorio.");

        RuleFor(x => x.StartDate)
            .Must(date => date != default).WithMessage("La fecha de inicio es obligatoria.");

        RuleFor(x => x.EndDate)
            .Must((request, endDate) => endDate > request.StartDate)
            .WithMessage("La fecha de fin debe ser posterior a la fecha de inicio.");

        RuleFor(x => x.Status)
            .Must(status => status is PlanStatus.Active or PlanStatus.Cancelled)
            .WithMessage("El estado debe ser Activo o Cancelado.");
    }
}
