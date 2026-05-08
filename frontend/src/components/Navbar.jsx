import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
const ESTADO_COLOR = {
  REGISTRADO: "badge-registrado",
  EN_TRANSITO: "badge-transito",
  EN_SUCURSAL_DESTINO: "badge-sucursal",
  EN_RUTA_ENTREGA: "badge-ruta",
  ENTREGADO: "badge-entregado",
  DEVUELTO: "badge-devuelto",
}
function NavLink({ to, children }) {
  const location = useLocation()
  const active = location.pathname === to
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
      }`}
    >
      {children}
    </Link>
  )
}
export default function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => {
    logout()
    navigate("/login")
  }
  if (!usuario) return null
  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <span className="font-bold text-slate-100 text-sm">ECOBOL</span>
              <span className="hidden sm:block text-xs text-slate-500">Sistema Postal Bolivia</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <NavLink to="/">Envios</NavLink>
            {(usuario.rol === "EMPLEADO" || usuario.rol === "ADMIN") && (
              <NavLink to="/estado">Actualizar Estado</NavLink>
            )}
            {(usuario.rol === "GERENTE" || usuario.rol === "ADMIN") && (
              <NavLink to="/dashboard">Dashboard</NavLink>
            )}
            {usuario.rol === "ADMIN" && (
              <NavLink to="/usuarios">Usuarios</NavLink>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-slate-200">
                {usuario.nombre} {usuario.apellido}
              </span>
              <span className={`badge text-xs ${ESTADO_COLOR[usuario.rol] || "badge-registrado"}`}>
                {usuario.rol}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="btn-ghost text-xs px-3 py-1.5"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
