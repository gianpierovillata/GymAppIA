using GymApi.Domain.Entities;

namespace GymApi.Application.Features.Trainers.Dtos;

public record TrainerResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string? Specialty,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt)
{
    public static TrainerResponse From(Trainer trainer) =>
        new(
            trainer.Id,
            trainer.FirstName,
            trainer.LastName,
            trainer.Email,
            trainer.Phone,
            trainer.Specialty,
            trainer.IsActive,
            trainer.CreatedAt,
            trainer.UpdatedAt);
}
