import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../../api/catalogApi";

function ProductThumb({ product }) {
  if (product.imagesFiles) {
    return (
      <div className="product-thumb">
        <img src={product.imagesFiles} alt={product.name} />
      </div>
    );
  }
  return (
    <div className="product-thumb" aria-hidden="true">
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

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <section>
      <h2>Catálogo</h2>

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
          {filtered.map((product) => (
            <article key={product.id} className="product-card">
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
          ))}
        </div>
      )}
    </section>
  );
}
