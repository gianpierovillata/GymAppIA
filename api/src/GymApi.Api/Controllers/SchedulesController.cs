using GymApi.Application.Features.Schedules;
using GymApi.Application.Features.Schedules.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace GymApi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SchedulesController : ControllerBase
{
    private readonly ScheduleService _scheduleService;

    public SchedulesController(ScheduleService scheduleService)
    {
        _scheduleService = scheduleService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var schedules = await _scheduleService.GetAllAsync(cancellationToken);
        return Ok(schedules);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleService.GetByIdAsync(id, cancellationToken);
        return Ok(schedule);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateScheduleRequest request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = schedule.Id }, schedule);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateScheduleRequest request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleService.UpdateAsync(id, request, cancellationToken);
        return Ok(schedule);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _scheduleService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
