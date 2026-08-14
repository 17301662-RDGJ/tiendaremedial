# Integración React para Órdenes

Este módulo no presupone una librería de estilos ni un gestor de estado. Copia `src/api/ordersApi.js` y `src/features/orders/CheckoutButton.jsx` a tu proyecto React.

Configura la URL del API en el `.env` del frontend:

```env
VITE_ORDERS_API_URL=https://tu-api-publica.example.com
```

Úsalo en la pantalla del basket, donde `userName` es el identificador con el que el Basket existente se consulta:

```jsx
import { CheckoutButton } from "./features/orders/CheckoutButton";

<CheckoutButton customerId={userName} basketId={userName} />
```

El componente muestra la confirmación (`id`, total y estado), deshabilita el botón mientras procesa y mantiene la misma clave de idempotencia durante reintentos. El servidor debe tener CORS habilitado para el dominio de tu frontend.
