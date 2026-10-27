using GymApi.Application.Features.Plans;
using GymApi.Application.Features.Plans.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace GymApi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlansController : ControllerBase
{
    private readonly PlanService _planService;
    private readonly ClientPlanService _clientPlanService;

    public PlansController(PlanService planService, ClientPlanService clientPlanService)
    {
        _planService = planService;
        _clientPlanService = clientPlanService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var plans = await _planService.GetAllAsync(cancellationToken);
        return Ok(plans);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var plan = await _planService.GetByIdAsync(id, cancellationToken);
        return Ok(plan);
    }

    [HttpGet("assignments")]
    public async Task<IActionResult> GetAssignments(CancellationToken cancellationToken)
    {
        var assignments = await _clientPlanService.GetAllAsync(cancellationToken);
        return Ok(assignments);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreatePlanRequest request, CancellationToken cancellationToken)
    {
        var plan = await _planService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = plan.Id }, plan);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdatePlanRequest request,
        CancellationToken cancellationToken)
    {
        var plan = await _planService.UpdateAsync(id, request, cancellationToken);
        return Ok(plan);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _planService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
