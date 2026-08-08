namespace GymApi.Application.Features.Trainers.Dtos;

public record CreateTrainerRequest(
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string? Specialty);
