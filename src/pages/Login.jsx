// Inicio de sesión con rol. Refs CAF-01.
import { useState } from 'react';
import { useAuth } from '../AuthContext';

export default function Login() {
  const { ingresar } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Escribe tu correo y tu contraseña');
      return;
    }
    setEnviando(true);
    try {
      await ingresar(email.trim(), password);
    } catch {
      setError('Correo o contraseña incorrectos');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="login">
      <form className="tarjeta" onSubmit={onSubmit} noValidate>
        <h1>Café Campus</h1>
        <p className="sub">Ingresa con tu cuenta de la cafetería</p>

        <label htmlFor="email">Correo</label>
        <input id="email" type="email" autoComplete="username" value={email}
          onChange={(e) => setEmail(e.target.value)} />

        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" autoComplete="current-password" value={password}
          onChange={(e) => setPassword(e.target.value)} />

        {error && <p className="error" role="alert">{error}</p>}

        <button className="primario" type="submit" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>

        <p className="aviso">
          Tratamiento de datos: Café Campus usa tu correo y tu nombre solo para identificarte
          dentro de la aplicación, conforme a la Ley 1581 de 2012. Puedes pedir su corrección
          o eliminación a la administración de la cafetería.
        </p>
      </form>
    </main>
  );
}
