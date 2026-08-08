using GymApi.Domain.Entities;
using GymApi.Domain.Enums;

namespace GymApi.Application.Features.Classes.Dtos;

public record ClassActivityResponse(
    Guid Id,
    string Name,
    ClassCategory Category,
    string? Description,
    int DurationMinutes,
    int Capacity,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt)
{
    public static ClassActivityResponse From(ClassActivity classActivity) =>
        new(
            classActivity.Id,
            classActivity.Name,
            classActivity.Category,
            classActivity.Description,
            classActivity.DurationMinutes,
            classActivity.Capacity,
            classActivity.IsActive,
            classActivity.CreatedAt,
            classActivity.UpdatedAt);
}
