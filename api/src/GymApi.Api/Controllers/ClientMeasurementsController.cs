using GymApi.Application.Features.ClientMeasurements;
using GymApi.Application.Features.ClientMeasurements.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace GymApi.Api.Controllers;

[ApiController]
[Route("api/clients/{clientId:guid}/measurements")]
public class ClientMeasurementsController : ControllerBase
{
    private readonly ClientMeasurementService _measurementService;

    public ClientMeasurementsController(ClientMeasurementService measurementService)
    {
        _measurementService = measurementService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid clientId, CancellationToken cancellationToken)
    {
        var measurements = await _measurementService.GetByClientAsync(clientId, cancellationToken);
        return Ok(measurements);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        Guid clientId,
        CreateClientMeasurementRequest request,
        CancellationToken cancellationToken)
    {
        var measurement = await _measurementService.CreateAsync(clientId, request, cancellationToken);
        return Ok(measurement);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid clientId,
        Guid id,
        UpdateClientMeasurementRequest request,
        CancellationToken cancellationToken)
    {
        var measurement = await _measurementService.UpdateAsync(clientId, id, request, cancellationToken);
        return Ok(measurement);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid clientId, Guid id, CancellationToken cancellationToken)
    {
        await _measurementService.DeleteAsync(clientId, id, cancellationToken);
        return NoContent();
    }
}
