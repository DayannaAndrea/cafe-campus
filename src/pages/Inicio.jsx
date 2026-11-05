// Página temporal después de iniciar sesión. CAF-02 la reemplaza con el menú. Refs CAF-01.
import { useAuth } from '../AuthContext';

export default function Inicio() {
  const { usuario, salir } = useAuth();
  return (
    <div className="app">
      <header className="barra">
        <strong>Café Campus</strong>
        <span className="usuario">{usuario.nombre} · {usuario.rol}</span>
        <button onClick={salir}>Salir</button>
      </header>
      <main className="contenido">
        <h1>Hola, {usuario.nombre}</h1>
        <p>Ingresaste con el rol {usuario.rol}.</p>
      </main>
    </div>
  );
}
