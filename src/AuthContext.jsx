// Sesión y rol del usuario. Refs CAF-01.
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null); // { uid, email, nombre, rol }
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUsuario(null);
        setCargando(false);
        return;
      }
      // El rol vive en users/{uid}; sin perfil no hay acceso.
      const perfil = await getDoc(doc(db, 'users', user.uid));
      if (perfil.exists()) {
        setUsuario({ uid: user.uid, email: user.email, ...perfil.data() });
      } else {
        await signOut(auth);
        setUsuario(null);
      }
      setCargando(false);
    });
  }, []);

  const ingresar = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const salir = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ usuario, cargando, ingresar, salir }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
