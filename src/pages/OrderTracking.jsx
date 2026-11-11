import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import OrderStatusAnimation from '../components/OrderStatusAnimation';
import { getOrders } from '../services/ordersApi';
import { money } from '../validation';
import './tracking.css';

const STEPS = [['recibido', 'Recibido'], ['preparacion', 'En preparación'], ['listo', 'Listo para recoger'], ['entregado', 'Entregado']];

export default function OrderTracking() {
  const [params] = useSearchParams();
  const requestedTicket = params.get('turno') || '';
  const [ticket, setTicket] = useState(requestedTicket);
  const [order, setOrder] = useState(null);
  const [searched, setSearched] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setRefresh((value) => value + 1), 1500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const number = requestedTicket.trim().replace(/^#/, '');
    if (!number) return;
    setTicket(number);
    const found = getOrders().find((item) => item.ticket === number);
    setOrder(found || false);
    setSearched(true);
  }, [requestedTicket]);

  function submit(event) {
    event.preventDefault();
    const number = ticket.trim().replace(/^#/, '');
    if (!number) return;
    const found = getOrders().find((item) => item.ticket === number);
    setOrder(found || false);
    setSearched(true);
  }

  const current = order && order !== false ? getOrders().find((item) => item.id === order.id) || order : null;
  const stepIndex = current ? STEPS.findIndex(([key]) => key === current.status) : -1;

  return <main className="tracking-page">
    <header>
      <Link to="/pedir" className="brand"><span className="brand-mark">cc</span><b>Café Campus</b></Link>
      <Link to="/login">Acceso equipo →</Link>
    </header>
    <section className="tracking-hero">
      <span className="kicker">CAF-06 · SEGUIMIENTO DE PEDIDO</span>
      <h1>Tu turno,<br /><em>en tiempo real.</em></h1>
      <p>Escribe el número de tu recibo y mira cómo va tu pedido.</p>
    </section>
    <section className="tracking-card">
      <div className="tracking-card-heading"><span className="kicker">CONSULTA TU PEDIDO</span><p>Usa el número que aparece en la confirmación de compra.</p></div>
      <form onSubmit={submit}>
        <span className="tracking-hash" aria-hidden="true">#</span>
        <input type="text" inputMode="numeric" autoComplete="off" maxLength={8} required aria-label="Número de turno" value={ticket} onChange={(event) => { setTicket(event.target.value); setSearched(false); setOrder(null); }} placeholder="Ej. 1048" />
        <button type="submit" className="action-button">Consultar turno</button>
      </form>
      {searched && current && <div className="tracking-result" key={refresh}>
        <div className="tracking-heading"><b>Turno #{current.ticket}</b><span>{STEPS.find(([key]) => key === current.status)?.[1] || 'Estado actualizado'}</span></div>
        <OrderStatusAnimation status={current.status} />
        <small>{current.customer} · {money(current.total)}</small>
        {current.pickup && <small className="tracking-pickup">Recogida: {new Date(current.pickup).toLocaleString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</small>}
        <div className="progress"><i style={{ width: `${(stepIndex + 1) * 25}%` }} /></div>
        <div className="step-labels">{STEPS.map(([key, label], index) => <span className={index <= stepIndex ? 'done' : ''} key={key}>{label}</span>)}</div>
      </div>}
      {searched && current === false && <p className="not-found">No encontramos ese turno. Verifica el número e inténtalo otra vez.</p>}
      <Link className="back-order" to="/pedir">Hacer un pedido anticipado →</Link>
    </section>
  </main>;
}
