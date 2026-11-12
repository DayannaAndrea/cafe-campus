import React from 'react';
import './order-status-animations.css';

const states = {
  recibido: { title: 'Pedido recibido', note: 'Ya lo anotamos y pronto empezaremos a prepararlo.' },
  preparacion: { title: 'En preparación', note: 'Nuestra barista está preparando tu pedido.' },
  listo: { title: 'Listo para recoger', note: 'Tu pedido está listo. Puedes pasar por él.' },
  entregado: { title: 'Pedido entregado', note: 'Gracias por visitarnos. ¡Que lo disfrutes!' },
};

export default function OrderStatusAnimation({ status, compact = false }) {
  const state = states[status] || states.recibido;
  const illustration = states[status] ? status : 'recibido';

  return <div className={`order-state-animation state-${illustration}${compact ? ' compact' : ''}`} aria-label={state.title}>
    <div className="order-state-art">
      <img src={`/illustrations/order-${illustration}.svg`} alt="" />
    </div>
    <div className="order-state-copy">
      <b>{state.title}</b>
      {!compact && <span>{state.note}</span>}
    </div>
  </div>;
}
