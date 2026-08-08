namespace GymApi.Application.Features.Clients.Dtos;

public record UpdateClientRequest(
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    DateOnly? BirthDate,
    string? Address);
