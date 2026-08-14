const catalogUrl = import.meta.env.VITE_CATALOG_API_URL ?? "http://localhost:5201";

export async function getProducts() {
  const response = await fetch(`${catalogUrl}/products`);
  if (!response.ok) {
    throw new Error("No fue posible cargar los productos.");
  }
  const data = await response.json();
  return data.products ?? [];
}

export async function createProduct({ name, description, category, imagesFiles, price }) {
  const response = await fetch(`${catalogUrl}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, category, imagesFiles, price }),
  });
  if (!response.ok) {
    throw new Error("No fue posible crear el producto.");
  }
  return response.json();
}

export async function updateProduct({ id, name, description, category, imagesFiles, price }) {
  const response = await fetch(`${catalogUrl}/products`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, name, description, category, imagesFiles, price }),
  });
  if (!response.ok) {
    throw new Error("No fue posible actualizar el producto.");
  }
  return response.json();
}

export async function deleteProduct(name) {
  const response = await fetch(`${catalogUrl}/products/${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("No fue posible eliminar el producto.");
  }
  return response.json();
}
