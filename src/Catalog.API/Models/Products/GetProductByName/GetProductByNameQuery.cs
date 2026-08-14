namespace Catalog.API.Models.Products.GetProductByName
{
  
    public record GetProductByNameQuery(string Name) : IQuery<Product>;
}