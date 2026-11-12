import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import OrderStatusAnimation from '../components/OrderStatusAnimation';
import { watchOrderByTrackingId } from '../services/ordersApi';
import { money } from '../validation';
import './tracking.css';

const STEPS = [
  ['recibido', 'Recibido'],
  ['preparacion', 'En preparación'],
  ['listo', 'Listo para recoger'],
  ['entregado', 'Entregado']
];

export default function OrderTracking() {
  const [params] = useSearchParams();
  const requestedId = params.get('id') || '';

  const [trackingId, setTrackingId] = useState(requestedId);
  const [searchId, setSearchId] = useState(requestedId);
  const [order, setOrder] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!requestedId) return;

    setTrackingId(requestedId);
    setSearchId(requestedId);
    setSearched(true);
  }, [requestedId]);

  useEffect(() => {
    if (!searched || !trackingId) return;

    setLoading(true);
    setOrder(null);

    const unsubscribe = watchOrderByTrackingId(
      trackingId,
      (foundOrder) => {
        setOrder(foundOrder || false);
        setLoading(false);
      },
      (error) => {
        console.error('Error al consultar el pedido:', error);
        setOrder(false);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [trackingId, searched]);

  function submit(event) {
    event.preventDefault();

    const id = searchId.trim();

    if (!id) return;

    setTrackingId(id);
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
        <span className="kicker">CAF-06 · SEGUIMIENTO DE PEDIDO</span>

        <h1>
          Tu turno,
          <br />
          <em>en tiempo real.</em>
        </h1>

        <p>
          Consulta el estado de tu pedido mediante el enlace
          de seguimiento que recibiste al confirmar tu compra.
        </p>
      </section>

      <section className="tracking-card">
        <div className="tracking-card-heading">
          <span className="kicker">CONSULTA TU PEDIDO</span>
          <p>Utiliza el identificador privado de seguimiento.</p>
        </div>

        <form onSubmit={submit}>
          <span className="tracking-hash" aria-hidden="true">#</span>

          <input
            type="text"
            autoComplete="off"
            required
            aria-label="Identificador de seguimiento"
            value={searchId}
            onChange={(event) => {
              setSearchId(event.target.value);
            }}
            placeholder="Identificador de seguimiento"
          />

          <button type="submit" className="action-button">
            Consultar pedido
          </button>
        </form>

        {loading && (
          <p>Consultando tu pedido...</p>
        )}

        {searched && !loading && current && (
          <div className="tracking-result">
            <div className="tracking-heading">
              <b>Turno #{current.ticket}</b>
              <span>
                {STEPS.find(([key]) => key === current.status)?.[1]
                  || 'Estado actualizado'}
              </span>
            </div>

            <OrderStatusAnimation status={current.status} />

            <small>
              {current.customer} · {money(current.total)}
            </small>

            {current.pickup && (
              <small className="tracking-pickup">
                Recogida:{' '}
                {new Date(current.pickup).toLocaleString('es-CO', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </small>
            )}

            <div className="progress">
              <i
                style={{
                  width: `${(stepIndex + 1) * 25}%`
                }}
              />
            </div>

            <div className="step-labels">
              {STEPS.map(([key, label], index) => (
                <span
                  className={index <= stepIndex ? 'done' : ''}
                  key={key}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {searched && !loading && current === false && (
          <p className="not-found">
            No encontramos ese pedido. Verifica tu enlace
            de seguimiento e inténtalo otra vez.
          </p>
        )}

        <Link className="back-order" to="/pedir">
          Hacer un pedido anticipado →
        </Link>
      </section>
    </main>
  );
}
