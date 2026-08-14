using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Ordering.API.Domain;

namespace Ordering.API.Infrastructure;

public sealed class MongoSettings
{
    public const string SectionName = "Mongo";
    public string ConnectionString { get; init; } = string.Empty;
    public string DatabaseName { get; init; } = "eshop_orders";
    public string CollectionName { get; init; } = "orders";
}

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<Order?> GetByIdempotencyKeyAsync(string key, CancellationToken ct);
    Task<IReadOnlyList<Order>> GetByCustomerAsync(string customerId, CancellationToken ct);
    Task CreateAsync(Order order, CancellationToken ct);
    Task<bool> ReplaceAsync(Order order, CancellationToken ct);
}

public sealed class MongoOrderRepository : IOrderRepository
{
    private readonly IMongoCollection<Order> _orders;

    public MongoOrderRepository(IOptions<MongoSettings> settings)
    {
        var value = settings.Value;
        if (string.IsNullOrWhiteSpace(value.ConnectionString))
            throw new InvalidOperationException("Mongo:ConnectionString no está configurada.");
        var database = new MongoClient(value.ConnectionString).GetDatabase(value.DatabaseName);
        _orders = database.GetCollection<Order>(value.CollectionName);
        _orders.Indexes.CreateOne(new CreateIndexModel<Order>(
            Builders<Order>.IndexKeys.Ascending(x => x.IdempotencyKey),
            new CreateIndexOptions { Unique = true, Name = "ux_idempotency_key" }));
    }

    public Task<Order?> GetByIdAsync(Guid id, CancellationToken ct) =>
        _orders.Find(x => x.Id == id).FirstOrDefaultAsync(ct);
    public Task<Order?> GetByIdempotencyKeyAsync(string key, CancellationToken ct) =>
        _orders.Find(x => x.IdempotencyKey == key).FirstOrDefaultAsync(ct);
    public async Task<IReadOnlyList<Order>> GetByCustomerAsync(string customerId, CancellationToken ct) =>
        await _orders.Find(x => x.CustomerId == customerId).SortByDescending(x => x.CreatedAt).ToListAsync(ct);
    public Task CreateAsync(Order order, CancellationToken ct) => _orders.InsertOneAsync(order, cancellationToken: ct);
    public async Task<bool> ReplaceAsync(Order order, CancellationToken ct) =>
        (await _orders.ReplaceOneAsync(x => x.Id == order.Id, order, cancellationToken: ct)).MatchedCount == 1;
}
