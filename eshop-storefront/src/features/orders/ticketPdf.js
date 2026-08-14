import { jsPDF } from "jspdf";

const STATUS_LABEL = {
  Pending: "Pendiente",
  Confirmed: "Confirmada",
  Cancelled: "Cancelada",
};

const WIDTH = 90; // mm, ancho típico de ticket
const MARGIN = 6;
const LINE_HEIGHT = 5;

export function downloadTicketPdf(order, customerId) {
  const metaRows = 4;
  const itemRows = order.items.length;
  const height =
    26 + // encabezado
    metaRows * LINE_HEIGHT +
    10 + // separadores
    (itemRows + 1) * LINE_HEIGHT + // encabezado de tabla + artículos
    18 + // totales
    14; // pie

  const doc = new jsPDF({ unit: "mm", format: [WIDTH, height] });
  const centerX = WIDTH / 2;
  let y = MARGIN;

  doc.setFont("courier", "bold");
  doc.setFontSize(14);
  doc.text("eShop", centerX, y, { align: "center" });
  y += 5;

  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  doc.text("Ticket de compra", centerX, y, { align: "center" });
  y += 4;

  doc.setLineDashPattern([1, 1], 0);
  doc.line(MARGIN, y, WIDTH - MARGIN, y);
  y += 5;

  const meta = [
    ["Folio", `#${order.id.slice(0, 8)}`],
    ["Fecha", new Date(order.createdAt).toLocaleString()],
    ["Cliente", customerId],
    ["Estado", STATUS_LABEL[order.status] ?? order.status],
  ];
  doc.setFontSize(8);
  meta.forEach(([label, value]) => {
    doc.text(label, MARGIN, y);
    doc.text(String(value), WIDTH - MARGIN, y, { align: "right" });
    y += LINE_HEIGHT;
  });

  doc.line(MARGIN, y, WIDTH - MARGIN, y);
  y += 5;

  const col = { name: MARGIN, qty: 46, price: 64, total: WIDTH - MARGIN };
  doc.setFont("courier", "bold");
  doc.text("Producto", col.name, y);
  doc.text("Cant.", col.qty, y, { align: "right" });
  doc.text("Precio", col.price, y, { align: "right" });
  doc.text("Importe", col.total, y, { align: "right" });
  y += 3;
  doc.line(MARGIN, y, WIDTH - MARGIN, y);
  y += 4;

  doc.setFont("courier", "normal");
  order.items.forEach((item) => {
    const name =
      item.productName.length > 18 ? `${item.productName.slice(0, 17)}…` : item.productName;
    doc.text(name, col.name, y);
    doc.text(String(item.quantity), col.qty, y, { align: "right" });
    doc.text(`$${Number(item.unitPrice).toFixed(2)}`, col.price, y, { align: "right" });
    doc.text(`$${Number(item.lineTotal).toFixed(2)}`, col.total, y, { align: "right" });
    y += LINE_HEIGHT;
  });

  doc.line(MARGIN, y, WIDTH - MARGIN, y);
  y += 5;

  doc.text("Subtotal", MARGIN, y);
  doc.text(`$${Number(order.subtotal).toFixed(2)}`, WIDTH - MARGIN, y, { align: "right" });
  y += LINE_HEIGHT;
  doc.text("Impuesto", MARGIN, y);
  doc.text(`$${Number(order.tax).toFixed(2)}`, WIDTH - MARGIN, y, { align: "right" });
  y += LINE_HEIGHT;

  doc.line(MARGIN, y, WIDTH - MARGIN, y);
  y += 5;
  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.text("Total", MARGIN, y);
  doc.text(`$${Number(order.total).toFixed(2)}`, WIDTH - MARGIN, y, { align: "right" });
  y += 8;

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.text("Gracias por tu compra", centerX, y, { align: "center" });

  doc.save(`ticket-${order.id.slice(0, 8)}.pdf`);
}
