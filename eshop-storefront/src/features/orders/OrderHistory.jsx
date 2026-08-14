import { useEffect, useState } from "react";
import { getOrdersByCustomer } from "../../api/ordersApi";

const STATUS_LABEL = {
  Pending: "Pendiente",
  Confirmed: "Confirmada",
  Cancelled: "Cancelada",
};

export function OrderHistory({ customerId, refreshKey }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getOrdersByCustomer(customerId)
      .then((data) => setOrders([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [customerId, refreshKey]);

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
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
