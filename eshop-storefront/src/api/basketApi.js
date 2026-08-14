const basketUrl = import.meta.env.VITE_BASKET_API_URL ?? "http://localhost:5249";

export async function getBasket(userName) {
  const response = await fetch(`${basketUrl}/basket/${encodeURIComponent(userName)}`);
  if (response.status === 404) {
    return { userName, items: [] };
  }
  if (!response.ok) {
    throw new Error("No fue posible cargar el carrito.");
  }
  const data = await response.json();
  return data.cart;
}

export async function saveBasket(cart) {
  const response = await fetch(`${basketUrl}/basket`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart }),
  });
  if (!response.ok) {
    throw new Error("No fue posible actualizar el carrito.");
  }
  return response.json();
}

export async function addItemToBasket(userName, product, quantity = 1) {
  const current = await getBasket(userName);
  const items = [...(current.items ?? [])];
  const existing = items.find((item) => item.productId === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity,
      color: "N/A",
    });
  }

  return saveBasket({ userName, items });
}

export async function removeItemFromBasket(userName, productId) {
  const current = await getBasket(userName);
  const items = (current.items ?? []).filter((item) => item.productId !== productId);
  return saveBasket({ userName, items });
}

export async function setItemQuantity(userName, productId, quantity) {
  const current = await getBasket(userName);
  const items =
    quantity <= 0
      ? (current.items ?? []).filter((item) => item.productId !== productId)
      : (current.items ?? []).map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );
  return saveBasket({ userName, items });
}
