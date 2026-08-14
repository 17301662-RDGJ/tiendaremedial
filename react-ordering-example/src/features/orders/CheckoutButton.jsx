import { useRef, useState } from "react";
import { createOrder } from "../../api/ordersApi";

/**
 * Recibe el id del cliente y el id del basket (en el proyecto base ambos
 * normalmente son el UserName). Colócalo en la pantalla donde se muestra el carrito.
 */
export function CheckoutButton({ customerId, basketId, onOrderCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const retryKey = useRef(null);

  async function handleCheckout() {
    setLoading(true);
    setError("");
    // La clave se conserva si el usuario reintenta por una falla de red.
    retryKey.current ??= crypto.randomUUID();

    try {
      const createdOrder = await createOrder({
        customerId,
        basketId,
        idempotencyKey: retryKey.current,
      });
      setOrder(createdOrder);
      retryKey.current = null;
      onOrderCreated?.(createdOrder);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  if (order) {
    return (
      <section role="status" aria-live="polite">
        <h2>Compra confirmada</h2>
        <p>Orden: <strong>{order.id}</strong></p>
        <p>Total: <strong>${Number(order.total).toFixed(2)}</strong></p>
        <p>Estado: {order.status}</p>
      </section>
    );
  }

  return (
    <section>
      <button type="button" onClick={handleCheckout} disabled={loading}>
        {loading ? "Generando orden..." : "Realizar compra"}
      </button>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
