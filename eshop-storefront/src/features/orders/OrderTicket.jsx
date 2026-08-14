const STATUS_LABEL = {
  Pending: "Pendiente",
  Confirmed: "Confirmada",
  Cancelled: "Cancelada",
};

export function OrderTicket({ order, customerId }) {
  return (
    <div className="print-ticket">
      <div className="ticket-header">
        <h2>eShop</h2>
        <p>Ticket de compra</p>
      </div>

      <div className="ticket-meta">
        <div>
          <span>Folio</span>
          <span>#{order.id.slice(0, 8)}</span>
        </div>
        <div>
          <span>Fecha</span>
          <span>{new Date(order.createdAt).toLocaleString()}</span>
        </div>
        <div>
          <span>Cliente</span>
          <span>{customerId}</span>
        </div>
        <div>
          <span>Estado</span>
          <span>{STATUS_LABEL[order.status] ?? order.status}</span>
        </div>
      </div>

      <table className="ticket-items">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.productId}>
              <td>{item.productName}</td>
              <td>{item.quantity}</td>
              <td>${Number(item.unitPrice).toFixed(2)}</td>
              <td>${Number(item.lineTotal).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ticket-totals">
        <div>
          <span>Subtotal</span>
          <span>${Number(order.subtotal).toFixed(2)}</span>
        </div>
        <div>
          <span>Impuesto</span>
          <span>${Number(order.tax).toFixed(2)}</span>
        </div>
        <div className="ticket-total-line">
          <span>Total</span>
          <span>${Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      <p className="ticket-footer">Gracias por tu compra</p>
    </div>
  );
}
