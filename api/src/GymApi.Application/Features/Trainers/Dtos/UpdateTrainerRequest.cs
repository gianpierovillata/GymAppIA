namespace GymApi.Application.Features.Trainers.Dtos;

public record UpdateTrainerRequest(
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string? Specialty);
