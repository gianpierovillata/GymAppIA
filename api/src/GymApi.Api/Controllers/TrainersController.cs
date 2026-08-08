using GymApi.Application.Features.Trainers;
using GymApi.Application.Features.Trainers.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace GymApi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrainersController : ControllerBase
{
    private readonly TrainerService _trainerService;

    public TrainersController(TrainerService trainerService)
    {
        _trainerService = trainerService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var trainers = await _trainerService.GetAllAsync(cancellationToken);
        return Ok(trainers);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var trainer = await _trainerService.GetByIdAsync(id, cancellationToken);
        return Ok(trainer);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTrainerRequest request, CancellationToken cancellationToken)
    {
        var trainer = await _trainerService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = trainer.Id }, trainer);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateTrainerRequest request, CancellationToken cancellationToken)
    {
        var trainer = await _trainerService.UpdateAsync(id, request, cancellationToken);
        return Ok(trainer);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _trainerService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
