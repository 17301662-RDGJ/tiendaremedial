namespace Catalog.API.Models.Products.GetProductByName
{
    public class GetProductByNameHandler : IRequestHandler<GetProductByNameQuery, Product>
    {
        private readonly IDocumentSession _documentSession;

        public GetProductByNameHandler(IDocumentSession documentSession)
        {
            _documentSession = documentSession;
        }

        public async Task<Product> Handle(GetProductByNameQuery request, CancellationToken cancellationToken)
        {
            var product = await _documentSession
                .Query<Product>()
                .FirstOrDefaultAsync(x => x.Name == request.Name, cancellationToken);

            return product;
        }
    }
}