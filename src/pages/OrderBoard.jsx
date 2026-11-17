import React, { useEffect, useState } from "react";
import {
  updateOrder,
  watchOrders,
  registerOrderPayment,
} from "../services/ordersApi";
import { money } from "../validation";
import OrderStatusAnimation from "../components/OrderStatusAnimation";
import "./board.css";

const states = [
  ["recibido", "Recibido"],
  ["preparacion", "En preparación"],
  ["listo", "Listo"],
  ["entregado", "Entregado"],
];

export default function OrderBoard() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Escuchar pedidos directamente desde Firestore.
  useEffect(() => {
    return watchOrders(
      (orders) => {
        setOrders(orders);
        setError("");
      },
      (error) => {
        console.error("Error al cargar pedidos:", error);
        setError("No fue posible cargar los pedidos.");
      },
    );
  }, []);

  // Avanzar el estado o abrir el formulario de pago.
  async function next(order) {
    if (order.status === "listo") {
      setSelectedOrder(order);
      setPaymentMethod("efectivo");
      setPaymentError("");
      setError("");
      return;
    }

    const index = states.findIndex(([key]) => key === order.status);

    if (index < 0 || index >= states.length - 1) {
      return;
    }

    try {
      await updateOrder(order.id, {
        status: states[index + 1][0],
      });
      setError("");
    } catch (error) {
      console.error("Error al actualizar el pedido:", error);
      setError("No fue posible actualizar el estado del pedido.");
    }
  }

  // Registrar el pago y entregar el pedido.
  async function confirmPayment(event) {
    event.preventDefault();

    if (!selectedOrder || paymentLoading) {
      return;
    }

    setPaymentLoading(true);
    setPaymentError("");

    try {
      await registerOrderPayment(selectedOrder.id, paymentMethod);

      setSelectedOrder(null);
      setPaymentMethod("efectivo");
      setPaymentError("");
    } catch (error) {
      console.error("Error al registrar el pago:", error);
      setPaymentError(error.message || "No fue posible registrar el pago.");
    } finally {
      setPaymentLoading(false);
    }
  }

  function closePaymentModal() {
    if (paymentLoading) {
      return;
    }

    setSelectedOrder(null);
    setPaymentError("");
  }

  return (
    <>
      <div className="board-status">
        <span>
          <i /> Actualizado en vivo
        </span>
        <b>{orders.length} pedidos</b>
      </div>

      {error && <p role="alert">{error}</p>}

      <div className="kanban">
        {states.map(([key, label]) => {
          const columnOrders = orders.filter((order) => order.status === key);

          return (
            <section className={`kanban-col status-column-${key}`} key={key}>
              <header>
                <i className={`dot ${key}`} />
                <b>{label}</b>
                <small>{columnOrders.length}</small>
              </header>

              <OrderStatusAnimation status={key} compact />

              {columnOrders.length ? (
                columnOrders.map((order) => (
                  <article className="kanban-card" key={order.id}>
                    <div>
                      <strong>#{order.ticket}</strong>
                      <span className="order-kind">
                        {order.kind === "anticipado"
                          ? "Anticipado"
                          : "Mostrador"}
                      </span>
                    </div>

                    <b>{order.customer}</b>

                    <p>
                      {order.items
                        .map((item) => `${item.qty}× ${item.name}`)
                        .join(" · ")}
                    </p>

                    {order.pickup && (
                      <small className="board-pickup">
                        Recoge:{" "}
                        {new Date(order.pickup).toLocaleString("es-CO", {
                          weekday: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    )}

                    <footer>
                      <strong>{money(order.total)}</strong>
                      <time>
                        {order.created
                          ? new Date(order.created).toLocaleTimeString(
                              "es-CO",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "--:--"}
                      </time>
                    </footer>

                    {key !== "entregado" && (
                      <button className="advance" onClick={() => next(order)}>
                        {key === "listo"
                          ? "Registrar pago y entregar"
                          : "Avanzar"}{" "}
                        →
                      </button>
                    )}
                  </article>
                ))
              ) : (
                <p className="board-empty">
                  Aún no hay pedidos en este estado.
                </p>
              )}
            </section>
          );
        })}
      </div>

      {selectedOrder && (
        <div className="payment-overlay" onClick={closePaymentModal}>
          <section
            className="payment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="payment-title">Registrar pago</h2>

            <p>
              Pedido <strong>#{selectedOrder.ticket}</strong>
            </p>

            <p>
              Cliente: <strong>{selectedOrder.customer}</strong>
            </p>

            <div className="payment-total">
              <span>Total a cobrar</span>
              <strong>{money(selectedOrder.total)}</strong>
            </div>

            <form onSubmit={confirmPayment}>
              <label htmlFor="payment-method">Método de pago</label>

              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                disabled={paymentLoading}
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
              </select>

              {paymentError && (
                <p className="payment-error" role="alert">
                  {paymentError}
                </p>
              )}

              <div className="payment-actions">
                <button
                  type="button"
                  onClick={closePaymentModal}
                  disabled={paymentLoading}
                >
                  Cancelar
                </button>

                <button type="submit" disabled={paymentLoading}>
                  {paymentLoading
                    ? "Registrando..."
                    : "Confirmar pago y entregar"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
