import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import OrderStatusAnimation from "../components/OrderStatusAnimation";
import { watchOrderByTrackingId } from "../services/ordersApi";
import { money } from "../validation";
import "./tracking.css";

const STEPS = [
  ["recibido", "Recibido"],
  ["preparacion", "En preparación"],
  ["listo", "Listo para recoger"],
  ["entregado", "Entregado"],
];

function readTrackingCode(value) {
  const input = value.trim();

  if (!input) return "";

  try {
    if (/^https?:\/\//i.test(input) || input.includes("?")) {
      const url = new URL(input, window.location.origin);
      return (
        url.searchParams.get("id") ||
        url.searchParams.get("trackingId") ||
        url.searchParams.get("codigo") ||
        ""
      );
    }
  } catch {
    return "";
  }

  return input;
}

const isTurnNumber = (value) => /^\d{4,8}$/.test(value.trim());

export default function OrderTracking() {
  const [params] = useSearchParams();
  const requestedId =
    params.get("id") || params.get("trackingId") || params.get("codigo") || "";
  const requestedTurn = params.get("turno") || "";

  const [trackingId, setTrackingId] = useState(requestedId);
  const [searchId, setSearchId] = useState(requestedId || requestedTurn);
  const [order, setOrder] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [turnNotice, setTurnNotice] = useState(
    Boolean(requestedTurn && !requestedId),
  );

  useEffect(() => {
    if (!requestedId) return;

    setTrackingId(requestedId);
    setSearchId(requestedId);
    setSearched(true);
    setTurnNotice(false);
  }, [requestedId]);

  useEffect(() => {
    if (!searched || !trackingId) return undefined;

    setLoading(true);
    setOrder(null);
    setLookupError("");

    const unsubscribe = watchOrderByTrackingId(
      trackingId,
      (foundOrder) => {
        setOrder(foundOrder || false);
        setLoading(false);
      },
      (error) => {
        console.error("Error al consultar el pedido:", error);
        setOrder(null);
        setLookupError(
          "No se pudo conectar con el seguimiento. Revisa tu conexión e inténtalo otra vez.",
        );
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [trackingId, searched]);

  function submit(event) {
    event.preventDefault();

    const code = readTrackingCode(searchId);

    if (!code) {
      setLookupError(
        "Pega el enlace completo o el código de seguimiento del recibo.",
      );
      setSearched(false);
      return;
    }

    if (isTurnNumber(code)) {
      setLookupError(
        "Ese número es tu turno para recoger. Para consultar el avance necesitas abrir o pegar el enlace de seguimiento que aparece al confirmar el pedido.",
      );
      setSearched(false);
      setOrder(null);
      setTurnNotice(false);
      return;
    }

    setLookupError("");
    setTurnNotice(false);
    setTrackingId(code);
    setSearched(true);
  }

  const current = order && order !== false ? order : null;
  const stepIndex = current
    ? STEPS.findIndex(([key]) => key === current.status)
    : -1;

  return (
    <main className="tracking-page">
      <header>
        <Link to="/pedir" className="brand">
          <span className="brand-mark">cc</span>
          <b>Café Campus</b>
        </Link>

        <Link to="/login">Acceso equipo →</Link>
      </header>

      <section className="tracking-hero">
        <span className="kicker">SEGUIMIENTO DE PEDIDO</span>

        <h1>
          Tu pedido,
          <br />
          <em>en tiempo real.</em>
        </h1>

        <p>
          Abre el enlace privado que aparece al confirmar tu pedido para ver
          cómo avanza, sin iniciar sesión.
        </p>
      </section>

      <section className="tracking-card">
        <div className="tracking-card-heading">
          <span className="kicker">CONSULTA TU PEDIDO</span>
          <p>Pega el código o el enlace de seguimiento de tu recibo.</p>
        </div>

        <form onSubmit={submit}>
          <span className="tracking-hash" aria-hidden="true">
            ↗
          </span>

          <input
            type="text"
            autoComplete="off"
            required
            aria-label="Código o enlace privado de seguimiento"
            value={searchId}
            onChange={(event) => {
              setSearchId(event.target.value);
              setLookupError("");
            }}
            placeholder="Pega aquí el código o enlace"
          />

          <button type="submit" className="action-button">
            Consultar pedido
          </button>
        </form>

        {turnNotice && (
          <p className="not-found" role="alert">
            El enlace recibido contiene solo el número de turno. Usa el enlace
            privado que aparece en la confirmación del pedido.
          </p>
        )}

        {lookupError && (
          <p className="not-found" role="alert">
            {lookupError}
          </p>
        )}

        {loading && <p role="status">Consultando tu pedido...</p>}

        {searched && !loading && !lookupError && current && (
          <div className="tracking-result">
            <div className="tracking-heading">
              <b>Turno #{current.ticket}</b>
              <span>
                {STEPS.find(([key]) => key === current.status)?.[1] ||
                  "Estado actualizado"}
              </span>
            </div>

            <OrderStatusAnimation status={current.status} />

            <small>
              {current.customer} · {money(current.total)}
            </small>

            {current.pickup && (
              <small className="tracking-pickup">
                Recogida:{" "}
                {new Date(current.pickup).toLocaleString("es-CO", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </small>
            )}

            <div className="progress">
              <i
                style={{
                  width: `${(stepIndex + 1) * 25}%`,
                }}
              />
            </div>

            <div className="step-labels">
              {STEPS.map(([key, label], index) => (
                <span className={index <= stepIndex ? "done" : ""} key={key}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {searched && !loading && !lookupError && current === false && (
          <p className="not-found" role="alert">
            No encontramos ese código de seguimiento. Revisa el enlace del
            recibo e inténtalo de nuevo.
          </p>
        )}

        <Link className="back-order" to="/pedir">
          Hacer un pedido anticipado →
        </Link>
      </section>
    </main>
  );
}
