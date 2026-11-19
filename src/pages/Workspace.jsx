import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MenuPage from "./MenuPage";
import NewOrder from "./NewOrder";
import OrderBoard from "./OrderBoard";
import { isAdministrator } from "../services/roleService";
import CashClosing from "./CashClosing";
import SalesReport from "./SalesReport";

export default function Workspace() {
  const { user, logout } = useAuth();
  const admin = isAdministrator(user);
  const [page, setPage] = useState(admin ? "menu" : "resumen");
  const nav = admin
    ? [
        { id: "menu", label: "Menú", icon: "☕" },
        { id: "cierre", label: "Cierre de caja", icon: "▣" },
        { id: "ventas", label: "Ventas por franja", icon: "▥" },
      ]
    : [
        { id: "resumen", label: "Resumen", icon: "◫" },
        { id: "menu", label: "Menú", icon: "☕" },
        { id: "pedido", label: "Nuevo pedido", icon: "＋" },
        { id: "tablero", label: "Tablero", icon: "▤" },
      ];
  const section = admin ? "Panel administrador" : "Panel cajero";

  const headings = admin
    ? { menu: "Administrar menú", cierre: "Cierre de caja", ventas: "Ventas por franja" }
    : {
        resumen: "Resumen",
        menu: "Menú",
        pedido: "Nuevo pedido",
        tablero: "Tablero de pedidos",
      };

  const descriptions = {
    resumen: "Revisa los accesos de caja y continúa con la atención.",
    menu: admin
      ? "Actualiza productos y disponibilidad de la cafetería."
      : "Consulta los productos disponibles.",
    pedido: "Registra pedidos y genera turnos al instante.",
    tablero: "Prepara los pedidos en orden.",
    cierre: "Consulta los recaudos y registra el cierre diario.",
    ventas: "Revisa qué se vendió por producto y por franja para decidir cuánto preparar.",
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to={admin ? "/admin" : "/caja"} className="brand">
          <span className="brand-mark">cc</span>
          <span>
            <b>Café Campus</b>
            <small>{section.toUpperCase()}</small>
          </span>
        </Link>
        <div className="branch">
          <i /> Sede principal <small>Campus universitario</small>
        </div>
        <nav>
          <span className="nav-title">{admin ? "ADMINISTRACIÓN" : "CAJA"}</span>
          {nav.map((item) => (
            <button
              className={`nav-item ${page === item.id ? "active" : ""}`}
              key={item.id}
              onClick={() => setPage(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
          {!admin && (
            <Link to="/pedir" className="nav-item">
              <span>◷</span>Pedido anticipado
            </Link>
          )}
        </nav>
        <div className="sidebar-bottom">
          <span className="open-dot" /> Operación activa{" "}
          <small>Pedidos y menú centralizados</small>
          <button className="logout" onClick={logout}>
            Salir de {user?.name}
          </button>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <span className="crumb">Café Campus</span>
            <b>/</b> {section} <b>/</b> {headings[page]}
          </div>
          <div className="topbar-meta">
            {new Date().toLocaleDateString("es-CO", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
            <span className="avatar">{user?.name?.slice(0, 1) || "CC"}</span>
          </div>
        </header>
        <section className="page">
          <div className="page-title">
            <div>
              <span className="kicker">
                CAFETERÍA UNIVERSITARIA · {section.toUpperCase()}
              </span>
              <h1>{headings[page]}</h1>
              <p>{descriptions[page]}</p>
            </div>
          </div>
          {page === "menu" ? (
            <MenuPage role={admin ? "administradora" : user?.role} />
          ) : page === "cierre" && admin ? (
            <CashClosing />
          ) : page === "ventas" && admin ? (
            <SalesReport />
          ) : page === "pedido" ? (
            <NewOrder />
          ) : page === "tablero" ? (
            <OrderBoard />
          ) : (
            <>
              <section className="hero">
                <div>
                  <span>CAFÉ CAMPUS · OPERACIÓN DE CAJA</span>
                  <h2>
                    Atiende cada pedido
                    <br />
                    con claridad.
                  </h2>
                  <p>
                    Registra órdenes y sigue su preparación desde un mismo
                    lugar.
                  </p>
                </div>
                <div className="hero-cup">
                  <span>cc</span>
                </div>
                <i className="sparkle">✳</i>
              </section>
              <div className="stats">
                <article>
                  <span>＋</span>
                  <small>Atención</small>
                  <b>Nuevo pedido</b>
                </article>
                <article>
                  <span>▤</span>
                  <small>Preparación</small>
                  <b>Tablero de pedidos</b>
                </article>
                <article>
                  <span>◷</span>
                  <small>Clientes</small>
                  <b>Pedido anticipado</b>
                </article>
              </div>
              <section className="content-card">
                <span className="kicker">ACCESOS DE CAJA</span>
                <h3>Continúa la atención</h3>
                <p>
                  Usa el menú de la izquierda para registrar un pedido, revisar
                  el tablero o consultar los productos.
                </p>
              </section>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
