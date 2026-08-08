using FluentValidation;
using GymApi.Application.Features.Classes;
using GymApi.Application.Features.Clients;
using GymApi.Application.Features.Schedules;
using GymApi.Application.Features.TrainerShifts;
using GymApi.Application.Features.Trainers;
using Microsoft.Extensions.DependencyInjection;

namespace GymApi.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddScoped<ClientService>();
        services.AddScoped<TrainerService>();
        services.AddScoped<ClassActivityService>();
        services.AddScoped<ScheduleService>();
        services.AddScoped<TrainerShiftService>();

        return services;
    }
}
