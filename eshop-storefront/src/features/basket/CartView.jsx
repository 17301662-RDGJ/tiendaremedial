import { useEffect, useState } from "react";
import { CheckoutButton } from "../orders/CheckoutButton";

export function CartView({ cart, loading, onSetQuantity, onOrderCreated }) {
  const items = cart?.items ?? [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Solo mostramos el skeleton en la carga inicial: si ya hay un carrito
  // cargado, un refresh en segundo plano no debe ocultar el contenido.
  const showSkeleton = loading && cart === null;

  // La confirmación vive aquí (no dentro de CheckoutButton) porque una compra
  // exitosa vacía el carrito en el backend: si la confirmación dependiera de
  // que items.length > 0 desaparecería en cuanto el carrito se recargara.
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    if (items.length > 0) setConfirmedOrder(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  function handleSuccess(order) {
    setConfirmedOrder(order);
    onOrderCreated?.(order);
  }

  return (
    <section className="cart-panel">
      <h2>
        Tu carrito
        {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
      </h2>

      {showSkeleton && <div className="skeleton" style={{ height: 120 }} />}

      {!showSkeleton && confirmedOrder && (
        <section role="status" aria-live="polite" className="order-confirmation">
          <h2>Compra confirmada</h2>
          <p>
            Orden: <strong>{confirmedOrder.id}</strong>
          </p>
          <p>
            Total: <strong>${Number(confirmedOrder.total).toFixed(2)}</strong>
          </p>
          <p>Estado: {confirmedOrder.status}</p>
        </section>
      )}

      {!showSkeleton && !confirmedOrder && items.length === 0 && (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.5 3h2l2.7 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21.5 8H6" />
          </svg>
          <p>Tu carrito está vacío. Agrega productos del catálogo.</p>
        </div>
      )}

      {!showSkeleton && !confirmedOrder && items.length > 0 && (
        <>
          <ul className="cart-list">
            {items.map((item) => (
              <li key={item.productId} className="cart-item">
                <div className="cart-item-info">
                  <span className="name">{item.productName}</span>
                  <span className="unit-price">${Number(item.price).toFixed(2)} c/u</span>
                </div>
                <div className="cart-item-right">
                  <div className="qty-stepper">
                    <button
                      type="button"
                      onClick={() => onSetQuantity(item.productId, item.quantity - 1)}
                      aria-label={`Reducir cantidad de ${item.productName}`}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onSetQuantity(item.productId, item.quantity + 1)}
                      aria-label={`Aumentar cantidad de ${item.productName}`}
                    >
                      +
                    </button>
                  </div>
                  <span className="line-total">${(item.price * item.quantity).toFixed(2)}</span>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => onSetQuantity(item.productId, 0)}
                    aria-label={`Quitar ${item.productName} del carrito`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-summary">
            <div className="summary-row total">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>

          <CheckoutButton
            customerId={cart.userName}
            basketId={cart.userName}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </section>
  );
}
