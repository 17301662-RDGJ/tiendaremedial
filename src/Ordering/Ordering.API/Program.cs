using Microsoft.AspNetCore.Diagnostics;
using MongoDB.Driver;
using Ordering.API.Application;
using Ordering.API.Domain;
using Ordering.API.Infrastructure;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
MongoDB.Bson.Serialization.BsonSerializer.RegisterSerializer(
    new MongoDB.Bson.Serialization.Serializers.GuidSerializer(MongoDB.Bson.GuidRepresentation.Standard));
builder.Services.Configure<MongoSettings>(builder.Configuration.GetSection(MongoSettings.SectionName));
builder.Services.AddSingleton<IOrderRepository, MongoOrderRepository>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddHttpClient<BasketClient>(client =>
    client.BaseAddress = new Uri(builder.Configuration["Services:BasketUrl"] ?? "http://localhost:5249/"));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddCors(options => options.AddPolicy("web", policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));
builder.Services.AddProblemDetails();

var app = builder.Build();
app.UseExceptionHandler(error => error.Run(async context =>
{
    var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
    app.Logger.LogError(exception, "Error no controlado procesando una orden.");
    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
    await Results.Problem("No fue posible procesar la orden.", statusCode: 500).ExecuteAsync(context);
}));
app.UseCors("web");
app.UseSwagger();
app.UseSwaggerUI();

var orders = app.MapGroup("/api/orders").WithTags("Orders");
orders.MapPost("/", async (CreateOrderRequest request, [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey, OrderService service, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.CustomerId) || string.IsNullOrWhiteSpace(request.BasketId))
        return Results.ValidationProblem(new Dictionary<string, string[]> { ["request"] = ["customerId y basketId son obligatorios."] });
    if (string.IsNullOrWhiteSpace(idempotencyKey))
        return Results.ValidationProblem(new Dictionary<string, string[]> { ["Idempotency-Key"] = ["El header Idempotency-Key es obligatorio."] });
    var (order, error, existing) = await service.CreateAsync(request, idempotencyKey, ct);
    if (order is null) return Results.BadRequest(new { error });
    return existing ? Results.Ok(order.ToResponse()) : Results.Created($"/api/orders/{order.Id}", order.ToResponse());
}).Produces<OrderResponse>(201).Produces<OrderResponse>(200).ProducesValidationProblem().Produces(400);

orders.MapGet("/{id:guid}", async (Guid id, IOrderRepository repository, CancellationToken ct) =>
    await repository.GetByIdAsync(id, ct) is { } order ? Results.Ok(order.ToResponse()) : Results.NotFound())
    .Produces<OrderResponse>().Produces(404);
orders.MapGet("/customer/{customerId}", async (string customerId, IOrderRepository repository, CancellationToken ct) =>
    Results.Ok((await repository.GetByCustomerAsync(customerId, ct)).Select(x => x.ToResponse())))
    .Produces<IEnumerable<OrderResponse>>();
orders.MapPatch("/{id:guid}/status", async (Guid id, ChangeOrderStatusRequest request, IOrderRepository repository, CancellationToken ct) =>
{
    var order = await repository.GetByIdAsync(id, ct);
    if (order is null) return Results.NotFound();
    if (!order.TryChangeStatus(request.Status)) return Results.Conflict(new { error = "Transición de estado no permitida." });
    await repository.ReplaceAsync(order, ct);
    return Results.Ok(order.ToResponse());
}).Produces<OrderResponse>().Produces(404).Produces(409);
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));
app.Run();
