import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
const NAV_ITEMS = [
  { to: "/",           label: "Envíos",            icon: "📦", roles: ["EMPLEADO", "GERENTE", "ADMIN"] },
  { to: "/estado",     label: "Actualizar Estado",  icon: "🔄", roles: ["EMPLEADO", "ADMIN"] },
  { to: "/dashboard",  label: "Dashboard",          icon: "📊", roles: ["GERENTE", "ADMIN"] },
  { to: "/sucursales", label: "Sucursales",          icon: "🏢", roles: ["ADMIN"] },
  { to: "/usuarios",   label: "Usuarios",            icon: "👥", roles: ["ADMIN"] },
]
const ROL_BADGE = {
  ADMIN:    "bg-red-900/60 text-red-300 border border-red-700/40",
  GERENTE:  "bg-violet-900/60 text-violet-300 border border-violet-700/40",
  EMPLEADO: "bg-blue-900/60 text-blue-300 border border-blue-700/40",
}
export default function Sidebar({ open, onClose }) {
  const { usuario, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [retrasados, setRetrasados] = useState(0)
  useEffect(() => {
    if (!usuario || !["GERENTE", "ADMIN"].includes(usuario.rol)) return
    const fetchRetrasados = () => {
      api.get("/estadisticas/").then(({ data }) => {
        setRetrasados(data.retrasados ?? 0)
      }).catch(() => {})
    }
    fetchRetrasados()
    const interval = setInterval(fetchRetrasados, 120_000)
    return () => clearInterval(interval)
  }, [usuario])
  if (!usuario) return null
  const handleLogout = () => {
    logout()
    navigate("/login")
  }
  const handleLinkClick = () => {
    if (onClose) onClose()
  }
  const linksVisibles = NAV_ITEMS.filter(item => item.roles.includes(usuario.rol))
  return (
    <aside
      className={`
        fixed left-0 top-0 h-full w-56 bg-slate-900 border-r border-slate-800
        flex flex-col z-40 shadow-2xl
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
            <span className="text-white font-bold text-base">E</span>
          </div>
          <div>
            <p className="font-bold text-slate-100 text-sm leading-tight">ECOBOL</p>
            <p className="text-slate-500 text-xs leading-tight">Sistema Postal Bolivia</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          aria-label="Cerrar menú"
        >
          ✕
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {linksVisibles.map(({ to, label, icon }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              }`}
            >
              <span className="text-base leading-none">{icon}</span>
              <span>{label}</span>
              {to === "/dashboard" && retrasados > 0 ? (
                <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                  {retrasados}
                </span>
              ) : active ? (
                <span className="ml-auto w-1.5 h-1.5 bg-blue-300 rounded-full" />
              ) : null}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 pb-2">
        <Link
          to="/rastreo"
          onClick={handleLinkClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all duration-200"
        >
          <span className="text-base leading-none">🔍</span>
          <span>Rastreo Público</span>
        </Link>
      </div>
      <div className="mx-3 border-t border-slate-800" />
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 rounded-xl bg-slate-800/50">
          <p className="text-sm font-semibold text-slate-200 truncate">
            {usuario.nombre} {usuario.apellido}
          </p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold mt-1 inline-block ${ROL_BADGE[usuario.rol]}`}>
            {usuario.rol}
          </span>
          {usuario.sucursal_nombre && (
            <p className="text-xs text-slate-500 mt-1 truncate">{usuario.sucursal_nombre}</p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200"
        >
          <span className="text-base leading-none">🚪</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
