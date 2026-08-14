using Ordering.API.Domain;

namespace Ordering.API.Application;

public sealed record CreateOrderRequest(string CustomerId, string BasketId);
public sealed record ChangeOrderStatusRequest(OrderStatus Status);
public sealed record OrderResponse(
    Guid Id, string CustomerId, DateTime CreatedAt, OrderStatus Status,
    IReadOnlyList<OrderItem> Items, decimal Subtotal, decimal Tax, decimal Total);

public static class OrderMappings
{
    public static OrderResponse ToResponse(this Order order) => new(
        order.Id, order.CustomerId, order.CreatedAt, order.Status, order.Items,
        order.Subtotal, order.Tax, order.Total);
}
