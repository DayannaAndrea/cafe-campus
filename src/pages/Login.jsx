import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './login-customer.css';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@cafecampus.test');
  const [password, setPassword] = useState('CafeAdmin2026');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try { await login(email, password); }
    catch { setError('Correo o contraseña incorrectos'); }
  }

  return <main className="login-page">
    <section className="login-art">
      <span className="brand-mark">cc</span>
      <span className="kicker">CAFÉ CAMPUS · OPERACIÓN</span>
      <h1>Todo fluye<br />mejor con<br /><em>un buen café.</em></h1>
      <p>Tu equipo, el menú y cada pedido en un mismo lugar.</p>
      <div className="login-cup">cc</div>
      <small>HECHO PARA TU EQUIPO</small>
    </section>
    <section className="login-form-wrap">
      <form className="login-form" onSubmit={submit}>
        <span className="kicker">BIENVENIDO DE VUELTA</span>
        <h2>Inicia sesión</h2>
        <p>Ingresa con tu cuenta de Café Campus.</p>
        <label>Correo electrónico<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="action-button">Entrar al espacio <span>→</span></button>
        <div className="demo-tip">● Demostración local · datos guardados en este navegador</div>
        <div className="login-shortcuts">
          <button type="button" onClick={() => { setEmail('admin@cafecampus.test'); setPassword('CafeAdmin2026'); }}>Usar cuenta admin</button>
          <button type="button" onClick={() => { setEmail('cajero@cafecampus.test'); setPassword('CafeCajero2026'); }}>Usar cuenta cajero</button>
        </div>
        <div className="customer-entry">
          <span className="customer-entry-label">ACCESO PARA CLIENTES</span>
          <Link className="customer-entry-link customer-order-link" to="/pedir">
            <span className="customer-entry-icon">☕</span>
            <span className="customer-entry-copy"><b>Pedido anticipado</b><small>Elige productos y hora de recogida</small></span>
            <span className="customer-entry-arrow">→</span>
          </Link>
          <Link className="customer-entry-link customer-track-link" to="/estado">
            <span className="customer-entry-icon">⌕</span>
            <span className="customer-entry-copy"><b>Consultar estado del pedido</b><small>Busca con tu número de turno</small></span>
            <span className="customer-entry-arrow">→</span>
          </Link>
        </div>
      </form>
    </section>
  </main>;
}
