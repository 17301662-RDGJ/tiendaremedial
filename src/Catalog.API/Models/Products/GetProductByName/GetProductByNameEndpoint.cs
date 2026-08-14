namespace Catalog.API.Models.Products.GetProductByName
{
    public class GetProductByNameEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            // Aquí usamos MapGet para permitir las peticiones de lectura
            app.MapGet("/products/{name}", async (string name, ISender sender) =>
            {
                var query = new GetProductByNameQuery(name);

                var result = await sender.Send(query);

                if (result == null)
                {
                    return Results.NotFound(new { message = "Producto no encontrado" });
                }

                // Se devuelve un objeto con la propiedad "Product" en mayúscula 
                // para que el frontend lo reciba como "product" en el JSON
                return Results.Ok(new { Product = result });
            })
            .WithName("GetProductByName")
            .Produces<Product>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .WithSummary("Obtener Producto por Nombre")
            .WithDescription("Busca y devuelve un producto específico basado en su nombre.");
        }
    }
}