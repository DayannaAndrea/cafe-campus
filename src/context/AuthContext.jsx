
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { loginFirebase, logoutFirebase, getUserProfile } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(firebaseUser);
        setUser(profile);
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
        setUser(null);
        await logoutFirebase();
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  async function login(email, password) {
    const profile = await loginFirebase(email, password);
    setUser(profile);
  }

  async function logout() {
    await logoutFirebase();
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, login, logout, loading }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth requiere AuthProvider');
  }

  return value;
}
