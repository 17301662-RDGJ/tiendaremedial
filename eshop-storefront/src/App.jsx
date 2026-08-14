import { useEffect, useState } from "react";
import { ProductList } from "./features/products/ProductList";
import { CartView } from "./features/basket/CartView";
import { OrderHistory } from "./features/orders/OrderHistory";
import { getBasket, addItemToBasket, setItemQuantity } from "./api/basketApi";
import "./App.css";

export default function App() {
  const [userName, setUserName] = useState(
    () => localStorage.getItem("eshop_userName") ?? "cliente-demo"
  );
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [view, setView] = useState("catalog");
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0);

  useEffect(() => {
    localStorage.setItem("eshop_userName", userName);
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName]);

  async function refreshCart() {
    setCartLoading(true);
    try {
      const data = await getBasket(userName);
      setCart(data);
    } finally {
      setCartLoading(false);
    }
  }

  async function handleAddToCart(product) {
    await addItemToBasket(userName, product);
    await refreshCart();
  }

  async function handleSetQuantity(productId, quantity) {
    await setItemQuantity(userName, productId, quantity);
    await refreshCart();
  }

  function handleOrderCreated() {
    refreshCart();
    setOrdersRefreshKey((key) => key + 1);
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="brand">
          <div className="brand-mark">eS</div>
          <h1>eShop</h1>
        </div>
        <div className="header-actions">
          <nav className="nav-tabs">
            <button
              type="button"
              className={view === "catalog" ? "active" : ""}
              onClick={() => setView("catalog")}
            >
              Catálogo
            </button>
            <button
              type="button"
              className={view === "orders" ? "active" : ""}
              onClick={() => setView("orders")}
            >
              Mis pedidos
            </button>
          </nav>
          <label className="user-field">
            Cliente:
            <input
              value={userName}
              onChange={(event) => setUserName(event.target.value.trim() || "cliente-demo")}
            />
          </label>
        </div>
      </header>

      <main className="layout">
        {view === "catalog" ? (
          <ProductList onAddToCart={handleAddToCart} />
        ) : (
          <OrderHistory customerId={userName} refreshKey={ordersRefreshKey} />
        )}
        <CartView
          cart={cart}
          loading={cartLoading}
          onSetQuantity={handleSetQuantity}
          onOrderCreated={handleOrderCreated}
        />
      </main>
    </div>
  );
}
