using Basket.API.Data;
using Basket.API.Models;
using BuildingBlocks.Exceptions.Handler;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Caching.Distributed;

var builder = WebApplication.CreateBuilder(args);

//=====================================
// MediatR
//=====================================

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

//=====================================
// Carter
//=====================================

builder.Services.AddCarter();

//=====================================
// Marten + PostgreSQL (Neon)
//=====================================

builder.Services.AddMarten(opts =>
{
    opts.Connection(builder.Configuration.GetConnectionString("Database")!);

    // El carrito se identifica por el UserName
    opts.Schema.For<ShoppingCart>()
        .Identity(x => x.UserName);

})
.UseLightweightSessions();

//=====================================
// Health Checks
//=====================================

builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("Database")!)
    .AddRedis(builder.Configuration.GetConnectionString("Redis")!);

//=====================================
// Repositorios
//=====================================

builder.Services.AddScoped<IBasketRepository, BasketRepository>();

// Decorador para utilizar Redis como caché
builder.Services.Decorate<IBasketRepository, CachedBasketRepository>();

// 1. Agrega esto junto a tus otros servicios (builder.Services)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});



//=====================================
// Redis
//=====================================

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});

//=====================================
// Excepciones
//=====================================

builder.Services.AddExceptionHandler<CustomExceptionHandler>();

builder.Services.AddProblemDetails();

//=====================================
// Construcción de la aplicación
//=====================================

var app = builder.Build();

//=====================================
// Endpoints
//=====================================

// 2. Agrega esto después de var app = builder.Build();
app.UseCors("AllowAll");

app.MapCarter();

//=====================================
// Middleware
//=====================================

app.UseExceptionHandler();

//=====================================
// Health
//=====================================

app.UseHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.Run();