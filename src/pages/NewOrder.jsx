import React, { useEffect, useState } from 'react';
import { watchProducts } from '../services/productsApi';
import { createOrder } from '../services/ordersApi';
import { money } from '../validation';
import './orders.css';

export default function NewOrder() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [customer, setCustomer] = useState('');
  const [created, setCreated] = useState(null);
  const [error, setError] = useState('');

  // Cargar productos desde Firestore en tiempo real.
  useEffect(() => {
    return watchProducts(
      (products) => {
        setProducts(products);
        setError('');
      },
      (error) => {
        console.error('Error al cargar productos:', error);
        setError('No fue posible cargar los productos.');
      }
    );
  }, []);

  const items = products
    .filter((p) => p.available && cart[p.id])
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      qty: cart[p.id]
    }));

  const total = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  function inc(id, delta) {
    setCart((current) => {
      const next = {
        ...current,
        [id]: (current[id] || 0) + delta
      };

      if (next[id] <= 0) {
        delete next[id];
      }

      return next;
    });
  }

  async function submit(e) {
    e.preventDefault();

    if (!items.length) return;

    try {
      const order = await createOrder({
        customer: customer.trim(),
        items
      });

      setCreated(order);
      setError('');
    } catch (error) {
      console.error('Error al crear el pedido:', error);
      setError('No fue posible crear el pedido. Inténtalo nuevamente.');
    }
  }

  return (
    <>
      {created ? (
        <section className="ticket-success">
          <span className="success-seal">✓</span>
          <span className="kicker">CAF-03 · TURNO GENERADO</span>
          <h2>Pedido confirmado</h2>
          <p>Entrégale este número al cliente.</p>
          <strong>#{created.ticket}</strong>

          <div>
            {created.items.map((item) => (
              <span key={item.name}>
                {item.qty}× {item.name}
              </span>
            ))}
          </div>

          <b>Total {money(created.total)}</b>

          <button
            className="action-button"
            onClick={() => {
              setCreated(null);
              setCart({});
              setCustomer('');
            }}
          >
            Crear siguiente pedido
          </button>
        </section>
      ) : (
        <div className="order-builder">
          <section className="order-catalog">
            <div className="section-heading">
              <div>
                <span className="kicker">CAF-03 · MOSTRADOR</span>
                <h2>Selecciona productos</h2>
              </div>

              <span className="subtle">
                {products.filter((p) => p.available).length} disponibles
              </span>
            </div>

            {error && <p role="alert">{error}</p>}

            <div className="order-products">
              {products
                .filter((p) => p.available)
                .map((p) => (
                  <button
                    className="order-product"
                    key={p.id}
                    onClick={() => inc(p.id, 1)}
                  >
                    <span>{p.emoji}</span>
                    <b>{p.name}</b>
                    <small>{p.category}</small>
                    <strong>{money(p.price)}</strong>
                    <i>＋</i>
                  </button>
                ))}
            </div>
          </section>

          <form className="order-cart" onSubmit={submit}>
            <span className="kicker">RESUMEN</span>
            <h3>Pedido actual</h3>

            <label>
              Cliente
              <input
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Nombre del cliente"
              />
            </label>

            <div className="cart-items">
              {items.map((item) => (
                <div className="cart-row" key={item.id}>
                  <span>
                    {item.name}
                    <small>{money(item.price)} c/u</small>
                  </span>

                  <div>
                    <button
                      type="button"
                      onClick={() => inc(item.id, -1)}
                    >
                      −
                    </button>

                    <b>{item.qty}</b>

                    <button
                      type="button"
                      onClick={() => inc(item.id, 1)}
                    >
                      ＋
                    </button>
                  </div>
                </div>
              ))}

              {!items.length && (
                <p className="empty-note">
                  Agrega productos para iniciar el pedido.
                </p>
              )}
            </div>

            <div className="cart-total">
              <span>Total</span>
              <b>{money(total)}</b>
            </div>

            <button
              className="action-button"
              disabled={!items.length}
            >
              Confirmar pedido →
            </button>
          </form>
        </div>
      )}
    </>
  );
}
