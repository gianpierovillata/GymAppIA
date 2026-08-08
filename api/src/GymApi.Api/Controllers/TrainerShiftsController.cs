using GymApi.Application.Features.TrainerShifts;
using GymApi.Application.Features.TrainerShifts.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace GymApi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrainerShiftsController : ControllerBase
{
    private readonly TrainerShiftService _shiftService;

    public TrainerShiftsController(TrainerShiftService shiftService)
    {
        _shiftService = shiftService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var shifts = await _shiftService.GetAllAsync(cancellationToken);
        return Ok(shifts);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var shift = await _shiftService.GetByIdAsync(id, cancellationToken);
        return Ok(shift);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTrainerShiftRequest request, CancellationToken cancellationToken)
    {
        var shift = await _shiftService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = shift.Id }, shift);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateTrainerShiftRequest request, CancellationToken cancellationToken)
    {
        var shift = await _shiftService.UpdateAsync(id, request, cancellationToken);
        return Ok(shift);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _shiftService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
