import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { watchProducts } from "../services/productsApi";
import { createOrder } from "../services/ordersApi";
import { money } from "../validation";
import "./customer.css";

export default function CustomerOrder() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [repeatLoading, setRepeatLoading] = useState(false);
  const [repeatError, setRepeatError] = useState("");

  const [when, setWhen] = useState(() => {
    const date = new Date(Date.now() + 45 * 60000);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  });

  const [ticket, setTicket] = useState(null);

  // Cargar solo productos disponibles desde Firestore.
  useEffect(() => {
    return watchProducts(
      (products) => {
        setProducts(products);
        setError("");
      },
      (error) => {
        console.error("Error al cargar el catálogo:", error);
        setError("No fue posible cargar el catálogo.");
      },
    );
  }, []);

  // Convierte una fecha al formato del campo datetime-local, en hora local.
  const toLocalInput = (value) => {
    const date = new Date(value);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  // RN-A3: se pide con al menos 15 minutos de anticipación.
  const minPickup = () => toLocalInput(Date.now() + 15 * 60000);

  const lines = products
    .filter((p) => p.available && cart[p.id])
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      qty: cart[p.id],
    }));

  const total = lines.reduce((sum, item) => sum + item.price * item.qty, 0);

  function change(id, amount) {
    setCart((current) => {
      const next = {
        ...current,
        [id]: (current[id] || 0) + amount,
      };

      if (next[id] < 1) {
        delete next[id];
      }

      return next;
    });
  }

  async function submit(e) {
    e.preventDefault();

    if (!lines.length) return;

    try {
      const order = await createOrder({
        customer: name.trim(),
        items: lines,
        kind: "anticipado",
        pickup: new Date(when).toISOString(),
      });

      setTicket(order);
      setError("");
    } catch (error) {
      console.error("Error al crear el pedido anticipado:", error);
      if (error.name === "SlotFullError") {
        // Franja llena: se ofrece la siguiente franja con cupo (RN-A3).
        setWhen(toLocalInput(error.suggested));
        setError(error.message);
      } else if (!error.code) {
        // Errores de validación propios: hora, producto agotado, cantidad.
        setError(error.message);
      } else {
        setError("No fue posible confirmar tu pedido. Inténtalo nuevamente.");
      }
    }
  }

  async function repeatOrder() {
    if (!ticket || repeatLoading) return;

    setRepeatLoading(true);
    setRepeatError("");

    try {
      const order = await createOrder({
        customer: ticket.customer,
        items: ticket.items,
        kind: "anticipado",
        pickup: new Date(Date.now() + 45 * 60000).toISOString(),
      });

      setTicket(order);
    } catch (repeatFailure) {
      console.error("Error al repetir el pedido:", repeatFailure);
      setRepeatError(
        repeatFailure.message ||
          "No fue posible repetir el pedido. Revisa los productos e inténtalo otra vez.",
      );
    } finally {
      setRepeatLoading(false);
    }
  }

  return (
    <main className="customer-page">
      <header>
        <Link to="/login" className="brand">
          <span className="brand-mark">cc</span>
          <b>Café Campus</b>
        </Link>

        <Link to="/login">Acceso equipo →</Link>
      </header>

      <section className="customer-hero">
        <span className="kicker">PEDIDO ANTICIPADO</span>
        <h1>
          Tu pausa favorita,
          <br />
          <em>sin hacer fila.</em>
        </h1>
        <p>Elige lo que se te antoja y dinos a qué hora pasas.</p>
        <span className="cup-art">☕</span>
      </section>

      {ticket ? (
        <section className="customer-ticket">
          <span className="success-seal">✓</span>
          <span className="kicker">PEDIDO ANTICIPADO LISTO</span>
          <h2>¡Gracias, {ticket.customer}!</h2>
          <p>Tu turno para recoger es</p>
          <strong>#{ticket.ticket}</strong>

          <small>
            Recogida:{" "}
            {new Date(ticket.pickup).toLocaleString("es-CO", {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </small>

          <p className="ticket-tracking-help">
            Guarda el enlace de seguimiento para volver a consultar el estado.
            El número de turno es para recoger tu pedido.
          </p>

          <Link
            className="action-button"
            to={`/estado?id=${ticket.trackingId}`}
          >
            Consultar estado del pedido →
          </Link>

          {repeatError && (
            <p className="repeat-ticket-error" role="alert">
              {repeatError}
            </p>
          )}

          <button
            className="repeat-ticket-button"
            type="button"
            onClick={repeatOrder}
            disabled={repeatLoading}
          >
            {repeatLoading ? "Creando nuevo pedido…" : "Repetir este pedido →"}
          </button>
          <small className="repeat-ticket-help">
            Se verifican los precios y la disponibilidad actuales; la recogida
            será aproximadamente en 45 minutos.
          </small>
        </section>
      ) : (
        <form className="customer-layout" onSubmit={submit}>
          <section className="customer-menu">
            <h2>¿Qué se te antoja?</h2>

            {error && <p role="alert">{error}</p>}

            <div className="customer-product-grid">
              {products
                .filter((p) => p.available)
                .map((p) => (
                  <button
                    type="button"
                    className="customer-product"
                    key={p.id}
                    onClick={() => change(p.id, 1)}
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

          <aside className="customer-cart">
            <span className="kicker">TU PEDIDO</span>
            <h2>Reserva y recoge</h2>

            <label>
              Tu nombre
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre y apellido"
              />
            </label>

            <label>
              Fecha y hora de recogida
              <input
                required
                type="datetime-local"
                min={minPickup()}
                value={when}
                onChange={(e) => setWhen(e.target.value)}
              />
            </label>

            <div className="customer-lines">
              {lines.map((item) => (
                <div key={item.id}>
                  <span>
                    {item.qty}× {item.name}
                  </span>
                  <b>{money(item.price * item.qty)}</b>
                </div>
              ))}

              {!lines.length && <p>Selecciona productos para continuar.</p>}
            </div>

            <div className="cart-total">
              <span>Total estimado</span>
              <b>{money(total)}</b>
            </div>

            <button className="action-button" disabled={!lines.length}>
              Confirmar pedido anticipado →
            </button>

            <small>Tu pedido será registrado de forma segura.</small>
          </aside>
        </form>
      )}
    </main>
  );
}
