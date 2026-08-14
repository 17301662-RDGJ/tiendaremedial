using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;

namespace Catalog.API.Exceptions
{
    public class CustomExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<CustomExceptionHandler> _logger;

        public CustomExceptionHandler(ILogger<CustomExceptionHandler> logger)
        { 
            _logger = logger;
        }

        /* Este metodo se encarga de manejar ls exepciones.  */
        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken)
        {
            _logger.LogError(
                exception,
                "Exception capturada");

            var statusCode = StatusCodes.Status500InternalServerError;

            if (exception is ValidationException)
            {
                statusCode = StatusCodes.Status400BadRequest;
            }

            httpContext.Response.StatusCode = statusCode;
            /* este metodo devuelve un json como respuesta */
            await httpContext.Response.WriteAsJsonAsync(new
            {
                Title = exception.GetType().Name,
                Status =statusCode,
                Detail = exception.Message
            }, cancellationToken);

            return true;
        }
    }
}
