using Catalog.API.Models.Products.CreateProduct;
using Mapster;

namespace Catalog.API.Models.Products.GetProducts
{
    public record GetProductsResponse(IEnumerable<Product> Products);
    public class GetProductsEndPoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/products", async (ISender sender) =>
            {
                var result = await sender.Send(new GetProductsQuery());
                var response = result.Adapt<GetProductsResponse>();
                return Results.Ok(response);
            })
                .WithName("GetProducto")
                .Produces<CreateProducResponse>(StatusCodes.Status201Created)
                .ProducesProblem(StatusCodes.Status400BadRequest)
                .WithSummary("Get Resumen")
                .WithDescription("Get Resumen");
        }
    }
}
