using GymApi.Application.Features.Plans;
using GymApi.Application.Features.Plans.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace GymApi.Api.Controllers;

[ApiController]
[Route("api/clients/{clientId:guid}/plans")]
public class ClientPlansController : ControllerBase
{
    private readonly ClientPlanService _clientPlanService;

    public ClientPlansController(ClientPlanService clientPlanService)
    {
        _clientPlanService = clientPlanService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid clientId, CancellationToken cancellationToken)
    {
        var plans = await _clientPlanService.GetByClientAsync(clientId, cancellationToken);
        return Ok(plans);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        Guid clientId,
        CreateClientPlanRequest request,
        CancellationToken cancellationToken)
    {
        var clientPlan = await _clientPlanService.CreateAsync(clientId, request, cancellationToken);
        return Ok(clientPlan);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid clientId,
        Guid id,
        UpdateClientPlanRequest request,
        CancellationToken cancellationToken)
    {
        var clientPlan = await _clientPlanService.UpdateAsync(clientId, id, request, cancellationToken);
        return Ok(clientPlan);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid clientId, Guid id, CancellationToken cancellationToken)
    {
        await _clientPlanService.DeleteAsync(clientId, id, cancellationToken);
        return NoContent();
    }
}
