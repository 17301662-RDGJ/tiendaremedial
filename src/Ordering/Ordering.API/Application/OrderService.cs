using MongoDB.Driver;
using Ordering.API.Domain;
using Ordering.API.Infrastructure;

namespace Ordering.API.Application;

public sealed class OrderService(IOrderRepository repository, BasketClient basketClient, ILogger<OrderService> logger)
{
    private const decimal TaxRate = 0.16m;

    public async Task<(Order? Order, string? Error, bool Existing)> CreateAsync(CreateOrderRequest request, string key, CancellationToken ct)
    {
        var existing = await repository.GetByIdempotencyKeyAsync(key, ct);
        if (existing is not null) return (existing, null, true);

        var basket = await basketClient.GetAsync(request.BasketId, ct);
        if (basket is null || basket.Items.Count == 0) return (null, "El basket no existe o está vacío.", false);
        if (basket.Items.Any(x => x.Quantity <= 0 || x.Price < 0 || x.ProductId == Guid.Empty || string.IsNullOrWhiteSpace(x.ProductName)))
            return (null, "El basket contiene productos inválidos.", false);

        var items = basket.Items.Select(x => new OrderItem { ProductId = x.ProductId, ProductName = x.ProductName, Quantity = x.Quantity, UnitPrice = x.Price }).ToList();
        var subtotal = items.Sum(x => x.LineTotal);
        var order = new Order { CustomerId = request.CustomerId.Trim(), BasketId = request.BasketId.Trim(), Items = items, Subtotal = subtotal, Tax = decimal.Round(subtotal * TaxRate, 2), Total = subtotal + decimal.Round(subtotal * TaxRate, 2), IdempotencyKey = key };
        try { await repository.CreateAsync(order, ct); }
        catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
        {
            logger.LogInformation("Reintento concurrente detectado para Idempotency-Key.");
            return (await repository.GetByIdempotencyKeyAsync(key, ct), null, true);
        }

        try { await basketClient.DeleteAsync(request.BasketId, ct); }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "No fue posible vaciar el basket {BasketId} tras crear la orden.", request.BasketId);
        }

        return (order, null, false);
    }
}
