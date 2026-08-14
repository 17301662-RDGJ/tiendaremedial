# eShop Storefront (React + Vite)

Frontend mínimo que integra los tres microservicios del proyecto:

- **Catalog.API** → lista de productos.
- **Basket.API** → agregar/quitar productos del carrito.
- **Ordering.API** → botón "Realizar compra" (con idempotencia).

## Correr en local

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Copia `.env.example` a `.env` y ajusta las URLs si tus servicios corren en otros puertos:
   ```bash
   cp .env.example .env
   ```
3. Asegúrate de tener corriendo (en tu otro proyecto .NET):
   - Catalog.API en `http://localhost:5201`
   - Basket.API en `http://localhost:5249`
   - Ordering.API en `http://localhost:8083`
4. Corre el frontend:
   ```bash
   npm run dev
   ```
5. Abre `http://localhost:5173`.

## Flujo de uso

1. Escribe un nombre de cliente en el campo de arriba (o deja el valor por defecto).
2. Agrega productos del catálogo al carrito.
3. Revisa el carrito a la derecha.
4. Da clic en **"Realizar compra"** — esto llama a `POST /api/orders` en el Ordering.API con un `Idempotency-Key` único y muestra la confirmación (id, total, estado).

## Publicar en Netlify

1. Sube este proyecto a un repositorio de GitHub.
2. En Netlify: **Add new site → Import an existing project** → conecta el repo.
3. Build command: `npm run build`. Publish directory: `dist`.
4. En **Site settings → Environment variables**, agrega:
   - `VITE_CATALOG_API_URL`
   - `VITE_BASKET_API_URL`
   - `VITE_ORDERS_API_URL`

   con las URLs **públicas** de tus tres microservicios ya publicados (no `localhost`).
5. Vuelve a desplegar (Netlify reconstruye automáticamente al hacer push, o puedes forzar un "Trigger deploy" tras agregar las variables).

## Nota sobre CORS

Los tres microservicios (`Catalog.API`, `Basket.API`, `Ordering.API`) ya tienen CORS abierto (`AllowAnyOrigin`), así que no necesitas configurar nada adicional para que Netlify les pueda hablar.
