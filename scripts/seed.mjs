// Carga los datos de prueba de la guía (sección 4.8): 2 usuarios y 6 productos.
// Uso: npm run seed   (requiere GOOGLE_APPLICATION_CREDENTIALS y las contraseñas en .env)
import 'dotenv/config';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const { SEED_ADMIN_PASSWORD, SEED_CAJERO_PASSWORD } = process.env;
if (!SEED_ADMIN_PASSWORD || !SEED_CAJERO_PASSWORD) {
  console.error('Faltan SEED_ADMIN_PASSWORD y SEED_CAJERO_PASSWORD en .env');
  process.exit(1);
}

initializeApp({ credential: applicationDefault() });
const auth = getAuth();
const db = getFirestore();

const usuarios = [
  { email: 'admin@cafecampus.test', password: SEED_ADMIN_PASSWORD, nombre: 'Patricia', rol: 'administradora' },
  { email: 'cajero@cafecampus.test', password: SEED_CAJERO_PASSWORD, nombre: 'Esteban', rol: 'cajero' },
];

const productos = [
  { nombre: 'Café tinto 7 oz', categoria: 'Bebidas calientes', precio: 2000, disponible: true },
  { nombre: 'Café con leche', categoria: 'Bebidas calientes', precio: 3500, disponible: true },
  { nombre: 'Empanada de carne', categoria: 'Panadería', precio: 3000, disponible: true },
  { nombre: 'Pandebono', categoria: 'Panadería', precio: 2500, disponible: false },
  { nombre: 'Jugo natural en agua', categoria: 'Bebidas frías', precio: 5000, disponible: true },
  { nombre: 'Almuerzo del día', categoria: 'Almuerzos', precio: 14000, disponible: true },
];

for (const u of usuarios) {
  let user;
  try {
    user = await auth.getUserByEmail(u.email);
    await auth.updateUser(user.uid, { password: u.password });
  } catch {
    user = await auth.createUser({ email: u.email, password: u.password, displayName: u.nombre });
  }
  await db.doc(`users/${user.uid}`).set({ nombre: u.nombre, rol: u.rol });
  console.log(`Usuario listo: ${u.email} (${u.rol})`);
}

const existentes = await db.collection('products').get();
const batch = db.batch();
existentes.forEach((d) => batch.delete(d.ref));
for (const p of productos) {
  batch.set(db.collection('products').doc(), { ...p, actualizadoEn: FieldValue.serverTimestamp() });
}
await batch.commit();
console.log(`${productos.length} productos cargados.`);
