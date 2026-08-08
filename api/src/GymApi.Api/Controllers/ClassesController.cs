using GymApi.Application.Features.Classes;
using GymApi.Application.Features.Classes.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace GymApi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClassesController : ControllerBase
{
    private readonly ClassActivityService _classActivityService;

    public ClassesController(ClassActivityService classActivityService)
    {
        _classActivityService = classActivityService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var classes = await _classActivityService.GetAllAsync(cancellationToken);
        return Ok(classes);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var classActivity = await _classActivityService.GetByIdAsync(id, cancellationToken);
        return Ok(classActivity);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateClassActivityRequest request, CancellationToken cancellationToken)
    {
        var classActivity = await _classActivityService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = classActivity.Id }, classActivity);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateClassActivityRequest request, CancellationToken cancellationToken)
    {
        var classActivity = await _classActivityService.UpdateAsync(id, request, cancellationToken);
        return Ok(classActivity);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _classActivityService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
