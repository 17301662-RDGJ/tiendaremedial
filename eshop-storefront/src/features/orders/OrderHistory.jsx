import { useEffect, useState } from "react";
import { getOrdersByCustomer } from "../../api/ordersApi";
import { OrderTicket } from "./OrderTicket";

const STATUS_LABEL = {
  Pending: "Pendiente",
  Confirmed: "Confirmada",
  Cancelled: "Cancelada",
};

export function OrderHistory({ customerId, refreshKey }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [printOrder, setPrintOrder] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    getOrdersByCustomer(customerId)
      .then((data) => setOrders([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [customerId, refreshKey]);

  useEffect(() => {
    if (!printOrder) return;
    const frame = requestAnimationFrame(() => window.print());
    return () => cancelAnimationFrame(frame);
  }, [printOrder]);

  useEffect(() => {
    function handleAfterPrint() {
      setPrintOrder(null);
    }
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  if (loading) {
    return (
      <section>
        <h2>Mis pedidos</h2>
        <div className="skeleton" style={{ height: 160 }} />
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2>Mis pedidos</h2>
        <p role="alert">{error}</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Mis pedidos</h2>
      {orders.length === 0 ? (
        <div className="empty-state">
          <p>Todavía no tienes pedidos con este nombre de cliente.</p>
        </div>
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order.id} className="order-row">
              <div className="order-row-header">
                <span className="order-id">#{order.id.slice(0, 8)}</span>
                <span className={`status-badge ${order.status.toLowerCase()}`}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>
              <div className="order-row-body">
                <span>{new Date(order.createdAt).toLocaleString()}</span>
                <span>{order.items.length} artículo(s) · ${Number(order.total).toFixed(2)}</span>
              </div>
              <button type="button" className="btn-ghost btn-print" onClick={() => setPrintOrder(order)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
                </svg>
                Imprimir ticket
              </button>
            </li>
          ))}
        </ul>
      )}

      {printOrder && <OrderTicket order={printOrder} customerId={customerId} />}
    </section>
  );
}
