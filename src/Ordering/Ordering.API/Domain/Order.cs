using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Ordering.API.Domain;

public sealed class Order
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; init; } = Guid.NewGuid();

    public required string CustomerId { get; init; }
    public required string BasketId { get; init; }
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public OrderStatus Status { get; private set; } = OrderStatus.Pending;
    public required List<OrderItem> Items { get; init; }
    public decimal Subtotal { get; init; }
    public decimal Tax { get; init; }
    public decimal Total { get; init; }

    // Se guarda para que los reintentos del cliente devuelvan la misma orden.
    public required string IdempotencyKey { get; init; }

    public bool TryChangeStatus(OrderStatus next)
    {
        if (Status != OrderStatus.Pending || next is not (OrderStatus.Confirmed or OrderStatus.Cancelled))
            return false;

        Status = next;
        return true;
    }
}

public sealed class OrderItem
{
    public required Guid ProductId { get; init; }
    public required string ProductName { get; init; }
    public required int Quantity { get; init; }
    public required decimal UnitPrice { get; init; }
    public decimal LineTotal => Quantity * UnitPrice;
}

public enum OrderStatus { Pending, Confirmed, Cancelled }
