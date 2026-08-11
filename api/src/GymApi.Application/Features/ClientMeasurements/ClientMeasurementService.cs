using FluentValidation;
using GymApi.Application.Abstractions;
using GymApi.Application.Features.ClientMeasurements.Dtos;
using GymApi.Domain.Entities;

namespace GymApi.Application.Features.ClientMeasurements;

public class ClientMeasurementService
{
    private static readonly TimeSpan CacheExpiration = TimeSpan.FromMinutes(5);

    private readonly IGenericRepository<ClientMeasurement> _measurements;
    private readonly IGenericRepository<Client> _clients;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cache;
    private readonly IValidator<CreateClientMeasurementRequest> _createValidator;
    private readonly IValidator<UpdateClientMeasurementRequest> _updateValidator;

    public ClientMeasurementService(
        IGenericRepository<ClientMeasurement> measurements,
        IGenericRepository<Client> clients,
        IUnitOfWork unitOfWork,
        ICacheService cache,
        IValidator<CreateClientMeasurementRequest> createValidator,
        IValidator<UpdateClientMeasurementRequest> updateValidator)
    {
        _measurements = measurements;
        _clients = clients;
        _unitOfWork = unitOfWork;
        _cache = cache;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<IReadOnlyList<ClientMeasurementResponse>> GetByClientAsync(
        Guid clientId,
        CancellationToken cancellationToken = default)
    {
        await EnsureClientExistsAsync(clientId, cancellationToken);

        return await _cache.GetOrSetAsync(
            MeasurementsCacheKey(clientId),
            async ct =>
            {
                var items = await _measurements.FindAsync(
                    m => m.ClientId == clientId && m.IsActive,
                    ct);

                return items
                    .OrderByDescending(m => m.MeasuredOn)
                    .Select(ClientMeasurementResponse.From)
                    .ToList();
            },
            CacheExpiration,
            cancellationToken);
    }

    public async Task<ClientMeasurementResponse> CreateAsync(
        Guid clientId,
        CreateClientMeasurementRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureClientExistsAsync(clientId, cancellationToken);
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);

        var measurement = new ClientMeasurement
        {
            ClientId = clientId,
            MeasuredOn = request.MeasuredOn,
            WeightKg = request.WeightKg,
            HeightCm = request.HeightCm,
            BodyFatPercentage = request.BodyFatPercentage,
            MuscleMassKg = request.MuscleMassKg,
            WaistCm = request.WaistCm,
            Notes = request.Notes,
        };

        await _measurements.AddAsync(measurement, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(clientId, cancellationToken);

        return ClientMeasurementResponse.From(measurement);
    }

    public async Task<ClientMeasurementResponse> UpdateAsync(
        Guid clientId,
        Guid measurementId,
        UpdateClientMeasurementRequest request,
        CancellationToken cancellationToken = default)
    {
        var measurement = await GetForClientAsync(clientId, measurementId, cancellationToken);
        await _updateValidator.ValidateAndThrowAsync(request, cancellationToken);

        measurement.MeasuredOn = request.MeasuredOn;
        measurement.WeightKg = request.WeightKg;
        measurement.HeightCm = request.HeightCm;
        measurement.BodyFatPercentage = request.BodyFatPercentage;
        measurement.MuscleMassKg = request.MuscleMassKg;
        measurement.WaistCm = request.WaistCm;
        measurement.Notes = request.Notes;

        _measurements.Update(measurement);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(clientId, cancellationToken);

        return ClientMeasurementResponse.From(measurement);
    }

    public async Task DeleteAsync(Guid clientId, Guid measurementId, CancellationToken cancellationToken = default)
    {
        var measurement = await GetForClientAsync(clientId, measurementId, cancellationToken);

        measurement.IsActive = false;

        _measurements.Update(measurement);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await InvalidateAsync(clientId, cancellationToken);
    }

    private async Task<ClientMeasurement> GetForClientAsync(
        Guid clientId,
        Guid measurementId,
        CancellationToken cancellationToken)
    {
        var measurement = await _measurements.GetByIdAsync(measurementId, cancellationToken);

        if (measurement is null || measurement.ClientId != clientId)
        {
            throw new KeyNotFoundException($"La medición con id {measurementId} no existe para el cliente {clientId}.");
        }

        return measurement;
    }

    private async Task EnsureClientExistsAsync(Guid clientId, CancellationToken cancellationToken)
    {
        var client = await _clients.GetByIdAsync(clientId, cancellationToken);

        if (client is null)
        {
            throw new KeyNotFoundException($"El cliente con id {clientId} no existe.");
        }
    }

    private static string MeasurementsCacheKey(Guid clientId) => $"clients:{clientId}:measurements";

    private async Task InvalidateAsync(Guid clientId, CancellationToken cancellationToken)
    {
        await _cache.RemoveAsync(MeasurementsCacheKey(clientId), cancellationToken);
    }
}
