import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { ToastProvider } from "./context/ToastContext"
import Layout from "./components/Layout"
import Login from "./pages/Login"
import GestionEnvios from "./pages/GestionEnvios"
import ActualizarEstado from "./pages/ActualizarEstado"
import RastreoPublico from "./pages/RastreoPublico"
import DashboardGerente from "./pages/DashboardGerente"
import GestionUsuarios from "./pages/GestionUsuarios"
import GestionSucursales from "./pages/GestionSucursales"
function ProtectedRoute({ children, roles = [] }) {
  const { usuario } = useAuth()
  if (!usuario) return <Navigate to="/login" replace />
  if (roles.length > 0 && !roles.includes(usuario.rol)) return <Navigate to="/" replace />
  return <Layout>{children}</Layout>
}
export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"   element={<Login />} />
            <Route path="/rastreo" element={<RastreoPublico />} />
            <Route path="/" element={
              <ProtectedRoute><GestionEnvios /></ProtectedRoute>
            } />
            <Route path="/estado" element={
              <ProtectedRoute roles={["EMPLEADO", "ADMIN"]}><ActualizarEstado /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute roles={["GERENTE", "ADMIN"]}><DashboardGerente /></ProtectedRoute>
            } />
            <Route path="/sucursales" element={
              <ProtectedRoute roles={["ADMIN"]}><GestionSucursales /></ProtectedRoute>
            } />
            <Route path="/usuarios" element={
              <ProtectedRoute roles={["ADMIN"]}><GestionUsuarios /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
