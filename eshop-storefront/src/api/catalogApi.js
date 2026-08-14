const catalogUrl = import.meta.env.VITE_CATALOG_API_URL ?? "http://localhost:5201";

export async function getProducts() {
  const response = await fetch(`${catalogUrl}/products`);
  if (!response.ok) {
    throw new Error("No fue posible cargar los productos.");
  }
  const data = await response.json();
  return data.products ?? [];
}
