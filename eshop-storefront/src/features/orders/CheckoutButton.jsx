import { useRef, useState } from "react";
import { createOrder } from "../../api/ordersApi";

/**
 * Recibe el id del cliente y el id del basket (en este proyecto ambos
 * son el userName). onSuccess recibe la orden creada; el llamador decide
 * cómo mostrar la confirmación.
 */
export function CheckoutButton({ customerId, basketId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      retryKey.current = null;
      onSuccess?.(createdOrder);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="checkout-actions">
      <button type="button" className="btn-block" onClick={handleCheckout} disabled={loading}>
        {loading ? "Generando orden..." : "Realizar compra"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
