using Carter;
using MediatR;

namespace Catalog.API.Models.Products.DeleteProduct
{
    public class DeleteProductEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapDelete("/products/{name}", async (string name, ISender sender) =>
            {
                var command = new DeleteProductCommand(name);

                var result = await sender.Send(command);

                return Results.Ok(result);
            })
            .WithName("DeleteProduct")
            .Produces<bool>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .WithSummary("Eliminar Producto")
            .WithDescription("Elimina un producto por nombre.");
        }
    }
}