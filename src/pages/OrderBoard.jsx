import React, { useEffect, useState } from 'react';
import { getOrders, updateOrder, watchOrders } from '../services/ordersApi';
import { money } from '../validation';
import OrderStatusAnimation from '../components/OrderStatusAnimation';
import './board.css';

const states = [['recibido', 'Recibido'], ['preparacion', 'En preparación'], ['listo', 'Listo'], ['entregado', 'Entregado']];

export default function OrderBoard() {
  const [orders, setOrders] = useState(getOrders);
  useEffect(() => watchOrders(() => setOrders(getOrders())), []);

  async function next(order) {
    const index = states.findIndex(([key]) => key === order.status);
    if (index < states.length - 1) await updateOrder(order.id, { status: states[index + 1][0] });
  }

  return <>
    <div className="board-status"><span><i /> Actualizado en vivo</span><b>{orders.length} pedidos</b></div>
    <div className="kanban">
      {states.map(([key, label]) => {
        const columnOrders = orders.filter((order) => order.status === key);
        return <section className={`kanban-col status-column-${key}`} key={key}>
          <header><i className={`dot ${key}`} /><b>{label}</b><small>{columnOrders.length}</small></header>
          <OrderStatusAnimation status={key} compact />
          {columnOrders.length ? columnOrders.map((order) => <article className="kanban-card" key={order.id}>
            <div><strong>#{order.ticket}</strong><span className="order-kind">{order.kind === 'anticipado' ? 'Anticipado' : 'Mostrador'}</span></div>
            <b>{order.customer}</b>
            <p>{order.items.map((item) => `${item.qty}× ${item.name}`).join(' · ')}</p>
            {order.pickup && <small className="board-pickup">Recoge: {new Date(order.pickup).toLocaleString('es-CO', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</small>}
            <footer><strong>{money(order.total)}</strong><time>{new Date(order.created).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</time></footer>
            {key !== 'entregado' && <button className="advance" onClick={() => next(order)}>{key === 'listo' ? 'Entregar' : 'Avanzar'} →</button>}
          </article>) : <p className="board-empty">Aún no hay pedidos en este estado.</p>}
        </section>;
      })}
    </div>
  </>;
}
