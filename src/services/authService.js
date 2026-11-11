import { readLocal, writeLocal } from './localStore';
const SESSION='session';
const USERS=[{email:'admin@cafecampus.test',password:'CafeAdmin2026',name:'Patricia',role:'administradora'},{email:'cajero@cafecampus.test',password:'CafeCajero2026',name:'Esteban',role:'cajero'}];
export function readSession(){return readLocal(SESSION,null)}
export async function loginDemo(email,password){const user=USERS.find(x=>x.email===email.trim().toLowerCase()&&x.password===password);if(!user)throw new Error('Credenciales inválidas');const session={name:user.name,email:user.email,role:user.role};writeLocal(SESSION,session);return session}
export async function logoutDemo(){localStorage.removeItem('cafe-campus:'+SESSION)}
