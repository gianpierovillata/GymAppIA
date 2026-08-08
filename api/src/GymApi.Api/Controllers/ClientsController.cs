using GymApi.Application.Features.Clients;
using GymApi.Application.Features.Clients.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace GymApi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private readonly ClientService _clientService;

    public ClientsController(ClientService clientService)
    {
        _clientService = clientService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var clients = await _clientService.GetAllAsync(cancellationToken);
        return Ok(clients);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var client = await _clientService.GetByIdAsync(id, cancellationToken);
        return Ok(client);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateClientRequest request, CancellationToken cancellationToken)
    {
        var client = await _clientService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = client.Id }, client);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateClientRequest request, CancellationToken cancellationToken)
    {
        var client = await _clientService.UpdateAsync(id, request, cancellationToken);
        return Ok(client);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _clientService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
