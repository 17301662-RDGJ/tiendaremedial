import { useEffect, useMemo, useState } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../../api/catalogApi";
import { ProductForm } from "./ProductForm";

const THUMB_GRADIENTS = [
  "linear-gradient(135deg, #ffd9c7, #ff8b63)",
  "linear-gradient(135deg, #cdefea, #4fb8a8)",
  "linear-gradient(135deg, #ffe8b8, #ffb627)",
  "linear-gradient(135deg, #fbd5e6, #f27fb0)",
  "linear-gradient(135deg, #dce6ff, #8aa6ff)",
  "linear-gradient(135deg, #e3d9ff, #b79cff)",
];

function gradientFor(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return THUMB_GRADIENTS[hash % THUMB_GRADIENTS.length];
}

function ProductThumb({ product }) {
  if (product.imagesFiles) {
    return (
      <div className="product-thumb">
        <img src={product.imagesFiles} alt={product.name} />
      </div>
    );
  }
  return (
    <div
      className="product-thumb"
      style={{ background: gradientFor(product.id ?? product.name ?? "") }}
      aria-hidden="true"
    >
      {product.name?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}

export function ProductList({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState(null);
  const [query, setQuery] = useState("");
  const [formMode, setFormMode] = useState(null); // null | "create" | product being edited
  const [deletingName, setDeletingName] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    refreshProducts();
  }, []);

  async function refreshProducts() {
    setLoading(true);
    setError("");
    try {
      setProducts(await getProducts());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      [product.name, product.descripcion, ...(product.category ?? [])]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term))
    );
  }, [products, query]);

  async function handleAdd(product) {
    setAddingId(product.id);
    try {
      await onAddToCart(product);
    } finally {
      setAddingId(null);
    }
  }

  async function handleSaveProduct(payload) {
    if (payload.id) {
      await updateProduct(payload);
    } else {
      await createProduct(payload);
    }
    setFormMode(null);
    await refreshProducts();
  }

  async function handleDelete(product) {
    if (!window.confirm(`¿Eliminar "${product.name}" del catálogo?`)) return;
    setActionError("");
    setDeletingName(product.name);
    try {
      await deleteProduct(product.name);
      await refreshProducts();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setDeletingName(null);
    }
  }

  return (
    <section>
      <div className="section-header">
        <h2>Catálogo</h2>
        {formMode !== "create" && (
          <button type="button" className="btn-ghost" onClick={() => setFormMode("create")}>
            + Nuevo producto
          </button>
        )}
      </div>

      {formMode === "create" && (
        <ProductForm onSubmit={handleSaveProduct} onCancel={() => setFormMode(null)} />
      )}

      <div className="search-field">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          disabled={loading || (products.length === 0 && !error)}
        />
      </div>

      {actionError && <p role="alert">{actionError}</p>}

      {loading && (
        <div className="product-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      )}

      {!loading && error && <p role="alert">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9h18M3 9l1.5 10.5A2 2 0 0 0 6.48 21h11.04a2 2 0 0 0 1.98-1.5L21 9M3 9l2-5h14l2 5" />
          </svg>
          <p>No hay productos en el catálogo todavía.</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && filtered.length === 0 && (
        <div className="empty-state">
          <p>No encontramos productos para "{query}".</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="product-grid">
          {filtered.map((product) =>
            formMode && formMode !== "create" && formMode.id === product.id ? (
              <ProductForm
                key={product.id}
                initialProduct={formMode}
                onSubmit={handleSaveProduct}
                onCancel={() => setFormMode(null)}
              />
            ) : (
              <article key={product.id} className="product-card">
                <div className="product-card-actions">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setFormMode(product)}
                    aria-label={`Editar ${product.name}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => handleDelete(product)}
                    disabled={deletingName === product.name}
                    aria-label={`Eliminar ${product.name}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
                    </svg>
                  </button>
                </div>
                <ProductThumb product={product} />
                <h3>{product.name}</h3>
                {product.descripcion && <p className="muted">{product.descripcion}</p>}
                <p className="price">${Number(product.price).toFixed(2)}</p>
                <button
                  type="button"
                  className="btn-block"
                  onClick={() => handleAdd(product)}
                  disabled={addingId === product.id}
                >
                  {addingId === product.id ? "Agregando..." : "Agregar al carrito"}
                </button>
              </article>
            )
          )}
        </div>
      )}
    </section>
  );
}
