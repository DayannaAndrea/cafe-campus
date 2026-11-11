import React, { createContext, useContext, useMemo, useState } from 'react';
import { loginDemo, logoutDemo, readSession } from '../services/authService';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);
  async function login(email, password) { const value = await loginDemo(email, password); setUser(value); }
  async function logout() { await logoutDemo(); setUser(null); }
  const value = useMemo(() => ({ user, login, logout, loading: false }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth requiere AuthProvider'); return value; }
