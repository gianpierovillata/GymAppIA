using GymApi.Domain.Entities;

namespace GymApi.Application.Features.Clients.Dtos;

public record ClientResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    DateOnly? BirthDate,
    string? Address,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt)
{
    public static ClientResponse From(Client client) =>
        new(
            client.Id,
            client.FirstName,
            client.LastName,
            client.Email,
            client.Phone,
            client.BirthDate,
            client.Address,
            client.IsActive,
            client.CreatedAt,
            client.UpdatedAt);
}
