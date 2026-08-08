namespace GymApi.Application.Features.Clients.Dtos;

public record CreateClientRequest(
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    DateOnly? BirthDate,
    string? Address);
