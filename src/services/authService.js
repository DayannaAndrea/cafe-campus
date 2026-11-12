
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export async function getUserProfile(firebaseUser) {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    throw new Error('El usuario no tiene un perfil registrado.');
  }

  const profile = userSnapshot.data();

  return {
    uid: firebaseUser.uid,
    name: profile.nombre,
    email: firebaseUser.email,
    role: profile.rol
  };
}

export async function loginFirebase(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );

    return await getUserProfile(credential.user);
  } catch (error) {
    if (error.code === 'auth/invalid-credential' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password') {
      throw new Error('Correo o contraseña incorrectos.');
    }

    if (error.code === 'auth/too-many-requests') {
      throw new Error('Demasiados intentos. Inténtalo más tarde.');
    }

    throw error;
  }
}

export async function logoutFirebase() {
  await signOut(auth);
}
