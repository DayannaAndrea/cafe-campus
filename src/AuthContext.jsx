import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// Autenticación local para desarrollo: no requiere Firebase ni un servidor.
const AuthContext = createContext(null);
const SESSION_KEY = 'cafe-campus-session';
const DEMO_USERS = [
  { email: 'admin@cafecampus.test', password: 'CafeAdmin2026', nombre: 'Patricia', rol: 'administradora' },
  { email: 'cajero@cafecampus.test', password: 'CafeCajero2026', nombre: 'Esteban', rol: 'cajero' },
];

function leerSesion() {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY));
    return saved && DEMO_USERS.some((user) => user.email === saved.email)
      ? { ...saved, uid: `local-${saved.email}` }
      : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setUsuario(leerSesion());
    setCargando(false);
  }, []);

  async function ingresar(email, password) {
    const user = DEMO_USERS.find((item) => item.email === email.toLowerCase() && item.password === password);
    if (!user) throw new Error('Correo o contraseña incorrectos.');
    const sesion = { email: user.email, nombre: user.nombre, rol: user.rol };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
    setUsuario({ ...sesion, uid: `local-${user.email}` });
  }

  async function salir() {
    localStorage.removeItem(SESSION_KEY);
    setUsuario(null);
  }

  const valor = useMemo(() => ({ usuario, cargando, ingresar, salir }), [usuario, cargando]);
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return context;
}
