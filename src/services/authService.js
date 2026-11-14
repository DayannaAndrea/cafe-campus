import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { isAdministrator } from "./roleService";

export async function getUserProfile(firebaseUser) {
  const userRef = doc(db, "users", firebaseUser.uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists())
    throw new Error("El usuario no tiene un perfil registrado.");

  const profile = snapshot.data();
  const rawRole =
    profile.rol || profile.role || profile.tipoRol || profile.userRole;
  const role = isAdministrator({ role: rawRole, email: firebaseUser.email })
    ? "administradora"
    : ["cajero", "cashier"].includes(
          String(rawRole || "")
            .trim()
            .toLowerCase(),
        )
      ? "cajero"
      : null;
  if (!role) throw new Error("El perfil no tiene un rol válido.");

  return {
    uid: firebaseUser.uid,
    name:
      profile.nombre ||
      profile.name ||
      firebaseUser.displayName ||
      firebaseUser.email,
    email: firebaseUser.email,
    role,
  };
}

export async function loginFirebase(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password,
    );
    return await getUserProfile(credential.user);
  } catch (error) {
    if (
      [
        "auth/invalid-credential",
        "auth/user-not-found",
        "auth/wrong-password",
      ].includes(error.code)
    ) {
      throw new Error("Correo o contraseña incorrectos.");
    }
    if (error.code === "auth/too-many-requests")
      throw new Error("Demasiados intentos. Inténtalo más tarde.");
    throw error;
  }
}

export async function logoutFirebase() {
  await signOut(auth);
}
