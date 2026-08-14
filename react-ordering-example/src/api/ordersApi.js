const ordersUrl = import.meta.env.VITE_ORDERS_API_URL ?? "http://localhost:8083";

export async function createOrder({ customerId, basketId, idempotencyKey }) {
  const response = await fetch(`${ordersUrl}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({ customerId, basketId }),
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new Error(problem?.error ?? problem?.detail ?? "No fue posible generar la orden.");
  }

  return response.json();
}
