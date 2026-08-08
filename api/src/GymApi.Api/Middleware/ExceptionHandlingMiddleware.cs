using FluentValidation;

namespace GymApi.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            await HandleAsync(context, exception);
        }
    }

    private async Task HandleAsync(HttpContext context, Exception exception)
    {
        int statusCode;
        object body;

        switch (exception)
        {
            case ValidationException validation:
                statusCode = StatusCodes.Status400BadRequest;
                var errors = validation.Errors.Select(e => e.ErrorMessage).Distinct().ToList();
                if (errors.Count == 0 && !string.IsNullOrWhiteSpace(validation.Message))
                {
                    errors.Add(validation.Message);
                }

                body = new { errors };
                break;

            case KeyNotFoundException notFound:
                statusCode = StatusCodes.Status404NotFound;
                body = new { message = notFound.Message };
                break;

            default:
                statusCode = StatusCodes.Status500InternalServerError;
                body = new { message = "Ocurrió un error inesperado." };
                break;
        }

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(exception, "Error no controlado.");
        }

        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsJsonAsync(body);
    }
}
