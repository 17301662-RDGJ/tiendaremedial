var builder = WebApplication.CreateBuilder(args);

// MediatR
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

// Carter
builder.Services.AddCarter();

// CORS (Configurado para permitir peticiones desde Netlify y cualquier origen)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Marten
builder.Services.AddMarten(opts =>
{
    opts.Connection(builder.Configuration.GetConnectionString("Database")!);
})
.UseLightweightSessions();

var app = builder.Build();

// Habilitar CORS (¡Obligatorio antes de MapCarter!)
app.UseCors("AllowAll");

// Carter
app.MapCarter();

app.Run();
