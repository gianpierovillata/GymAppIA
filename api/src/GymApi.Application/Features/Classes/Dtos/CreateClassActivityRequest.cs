using GymApi.Domain.Enums;

namespace GymApi.Application.Features.Classes.Dtos;

public record CreateClassActivityRequest(
    string Name,
    ClassCategory Category,
    string? Description,
    int DurationMinutes,
    int Capacity);
