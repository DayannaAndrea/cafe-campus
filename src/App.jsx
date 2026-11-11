import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Workspace from './pages/Workspace';
import CustomerOrder from './pages/CustomerOrder';

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="boot">Preparando Café Campus…</div>;
  return <Routes><Route path="/login" element={user ? <Navigate to="/" replace/> : <Login/>}/><Route path="/pedir" element={<CustomerOrder/>}/><Route path="/*" element={user ? <Workspace/> : <Navigate to="/login" replace/>}/></Routes>;
}
