using FluentValidation;
using GymApi.Application.Features.ClientMeasurements.Dtos;

namespace GymApi.Application.Features.ClientMeasurements.Validators;

public class CreateClientMeasurementValidator : AbstractValidator<CreateClientMeasurementRequest>
{
    public CreateClientMeasurementValidator()
    {
        RuleFor(x => x.MeasuredOn)
            .NotEmpty().WithMessage("La fecha de medición es obligatoria.")
            .Must(d => d <= DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("La fecha de medición no puede ser futura.");

        RuleFor(x => x.WeightKg)
            .Must(v => !v.HasValue || v is >= 20 and <= 500)
            .WithMessage("El peso debe estar entre 20 y 500 kg.");

        RuleFor(x => x.HeightCm)
            .Must(v => !v.HasValue || v is >= 50 and <= 250)
            .WithMessage("La altura debe estar entre 50 y 250 cm.");

        RuleFor(x => x.BodyFatPercentage)
            .Must(v => !v.HasValue || v is >= 0 and <= 75)
            .WithMessage("El porcentaje de grasa debe estar entre 0 y 75.");

        RuleFor(x => x.MuscleMassKg)
            .Must(v => !v.HasValue || v is >= 10 and <= 300)
            .WithMessage("La masa muscular debe estar entre 10 y 300 kg.");

        RuleFor(x => x.WaistCm)
            .Must(v => !v.HasValue || v is >= 20 and <= 300)
            .WithMessage("La cintura debe estar entre 20 y 300 cm.");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Las observaciones no pueden superar 500 caracteres.");
    }
}
