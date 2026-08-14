# eShop Services - Microservicio de Órdenes

El proyecto incluye `Ordering.API`, una Minimal API en .NET 9 que lee el basket existente mediante HTTP y persiste una fotografía de precios en MongoDB Atlas.

## Despliegue en producción

| Componente | URL | Tecnología |
|---|---|---|
| Frontend (React) | https://serene-vacherin-344e2d.netlify.app/ | Netlify |
| Catalog.API | https://catalog-api-e2m5.onrender.com | Render + Neon (PostgreSQL) |
| Basket.API | https://basket-api-xs10.onrender.com | Render + Neon (PostgreSQL) + Upstash (Redis) |
| Ordering.API | https://ordering-apitiendaremedial.onrender.com | Render + MongoDB Atlas |
| Swagger de Ordering.API | https://ordering-apitiendaremedial.onrender.com/swagger | — |

Los servicios en Render están en el plan gratuito: si nadie los usa por un rato "se duermen" y la primera petición puede tardar hasta ~50 segundos en responder mientras despiertan.

## Configuración

No subas secretos. Define estas variables antes de ejecutar:

```powershell
$env:Mongo__ConnectionString = "mongodb+srv://USUARIO:CONTRASENA@CLUSTER/..."
$env:Mongo__DatabaseName = "eshop_orders"
$env:Services__BasketUrl = "http://localhost:5249/"
dotnet run --project src/Ordering/Ordering.API
```

Swagger queda disponible en `http://localhost:5000/swagger` (o el puerto que indique `dotnet run`). La API espera que Basket responda `GET /basket/{basketId}` con `{ cart: { userName, items } }`.

## Endpoints

- `POST /api/orders` con `{ "customerId": "cliente-1", "basketId": "cliente-1" }` y header obligatorio `Idempotency-Key`. Devuelve `201`; un reintento con la misma clave devuelve la orden existente (`200`) sin duplicarla.
- `GET /api/orders/{id}`.
- `GET /api/orders/customer/{customerId}`.
- `PATCH /api/orders/{id}/status` con `{ "status": "Confirmed" }` o `Cancelled`. Sólo se permite `Pending -> Confirmed` y `Pending -> Cancelled`.

Ejemplo de compra:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/orders -Headers @{ "Idempotency-Key" = [guid]::NewGuid().ToString() } -ContentType "application/json" -Body '{"customerId":"ana","basketId":"ana"}'
```

## Integración React

Incluye un módulo listo para copiar en `react-ordering-example/`. En el botón **Realizar compra** hace un `POST` al servicio con `customerId`, `basketId` y un UUID nuevo como `Idempotency-Key`, muestra la respuesta `id` y `total` como confirmación y conserva la misma clave mientras reintenta la petición.

## Evidencias sugeridas

Demuestra en Swagger o Postman: creación (201), consulta (200), basket vacío (400), reenvío con la misma clave (200 y mismo `id`), cambio `Pending -> Confirmed` (200) y cambio posterior a `Cancelled` (409).
