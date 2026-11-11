import {readLocal,writeLocal,subscribeLocal} from './localStore';
const KEY='products';
const SEED=[{id:'p1',name:'Café tinto 7 oz',category:'Bebidas calientes',price:2000,available:true,emoji:'☕'},{id:'p2',name:'Café con leche',category:'Bebidas calientes',price:3500,available:true,emoji:'🥛'},{id:'p3',name:'Empanada de carne',category:'Panadería',price:3000,available:true,emoji:'🥟'},{id:'p4',name:'Pandebono',category:'Panadería',price:2500,available:false,emoji:'🥐'},{id:'p5',name:'Jugo natural',category:'Bebidas frías',price:5000,available:true,emoji:'🧃'},{id:'p6',name:'Almuerzo del día',category:'Almuerzos',price:14000,available:true,emoji:'🍲'}];
export const getProducts=()=>readLocal(KEY,SEED);
export const watchProducts=(fn)=>subscribeLocal(KEY,fn);
export async function saveProduct(product){const list=getProducts();const id=product.id||`p${Date.now()}`;const next=product.id?list.map(p=>p.id===id?{...p,...product,price:Number(product.price)}:p):[...list,{...product,id,price:Number(product.price)}];writeLocal(KEY,next);return id}
