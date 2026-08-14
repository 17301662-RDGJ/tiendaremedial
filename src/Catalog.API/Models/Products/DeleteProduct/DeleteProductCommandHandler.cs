namespace Catalog.API.Models.Products.DeleteProduct
{
    public record DeleteProductCommand(string Name) : ICommand<bool>;

    public class DeleteProductCommandHandler
        : ICommandHandler<DeleteProductCommand, bool>
    {
        private readonly IDocumentSession _documentSession;

        public DeleteProductCommandHandler(IDocumentSession documentSession)
        {
            _documentSession = documentSession;
        }

        public async Task<bool> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
        {
            var product = await _documentSession
                .Query<Product>()
                .FirstOrDefaultAsync(x => x.Name == request.Name, cancellationToken);

            if (product == null)
            {
                throw new Exception("Producto no encontrado.");
            }

            _documentSession.Delete(product);

            await _documentSession.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}