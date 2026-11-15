import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Workspace from "./pages/Workspace";
import CustomerOrder from "./pages/CustomerOrder";
import OrderTracking from "./pages/OrderTracking";
import { isAdministrator, workspaceHome } from "./services/roleService";

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="boot">Preparando Café Campus…</div>;
  const admin = isAdministrator(user);
  const home = workspaceHome(user);

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={home} replace /> : <Login />}
      />
      <Route path="/pedir" element={<CustomerOrder />} />
      <Route path="/estado" element={<OrderTracking />} />
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={home} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/admin/*"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : admin ? (
            <Workspace />
          ) : (
            <Navigate to="/caja" replace />
          )
        }
      />
      <Route
        path="/caja/*"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : admin ? (
            <Navigate to="/admin" replace />
          ) : (
            <Workspace />
          )
        }
      />
      <Route
        path="*"
        element={<Navigate to={user ? home : "/login"} replace />}
      />
    </Routes>
  );
}
