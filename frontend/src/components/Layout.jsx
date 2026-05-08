import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  LayoutDashboard, Package, ArrowRightLeft, Users, LogOut,
  Menu, X, Search, Bell, MapPin, ChevronLeft, ChevronRight
} from "lucide-react"
import ecobolLogo from "../assets/logos/ecobol_logo.png"

export default function Layout({ children }) {
  const { usuario, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  if (!usuario) return children

  const handleLogout = () => { logout(); navigate("/login") }

  const menuItems = [
    { title: "Envios",           path: "/",          icon: Package,         roles: ["EMPLEADO","GERENTE","ADMIN"] },
    { title: "Actualizar Estado",path: "/estado",     icon: ArrowRightLeft,  roles: ["EMPLEADO","ADMIN"] },
    { title: "Dashboard",        path: "/dashboard",  icon: LayoutDashboard, roles: ["GERENTE","ADMIN"] },
    { title: "Sucursales",       path: "/sucursales", icon: MapPin,          roles: ["ADMIN"] },
    { title: "Usuarios",         path: "/usuarios",   icon: Users,           roles: ["ADMIN"] },
  ]

  const navLinks = menuItems.filter(i => i.roles.includes(usuario.rol))
  const sideW = collapsed ? "w-16" : "w-64"

  return (
    <div className="min-h-screen bg-black flex overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}


      <aside className={`fixed lg:static inset-y-0 left-0 z-50 ${sideW} bg-zinc-950 border-r border-zinc-900 flex flex-col transition-all duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >

        <div className={`h-16 flex items-center border-b border-zinc-900 ${collapsed ? "justify-center px-2" : "px-4 justify-between"}`}>
          {!collapsed && <img src={ecobolLogo} alt="ECOBOL" className="h-9 object-contain" />}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
              title={collapsed ? "Expandir menú" : "Colapsar menú"}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            <button onClick={() => setMobileOpen(false)} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>


        {!collapsed && (
          <div className="p-4 border-b border-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-400 font-bold text-xs">{usuario.nombre?.[0]}{usuario.apellido?.[0]}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{usuario.nombre} {usuario.apellido}</p>
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 font-medium">{usuario.rol}</span>
              </div>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="p-2 border-b border-zinc-900 flex justify-center">
            <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <span className="text-orange-400 font-bold text-xs">{usuario.nombre?.[0]}</span>
            </div>
          </div>
        )}


        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {navLinks.map((item) => {
            const active = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                title={collapsed ? item.title : undefined}
                className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2.5"}
                  ${active ? "bg-orange-500/10 text-orange-400" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
              >
                <item.icon size={17} className={active ? "text-orange-500 flex-shrink-0" : "text-zinc-600 flex-shrink-0"} />
                {!collapsed && item.title}
              </Link>
            )
          })}

          <Link to="/rastreo" onClick={() => setMobileOpen(false)} title={collapsed ? "Rastreo Público" : undefined}
            className={`flex items-center gap-3 rounded-xl text-sm font-medium text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 transition-all duration-200
              ${collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2.5"}`}
          >
            <Search size={17} className="text-zinc-600 flex-shrink-0" />
            {!collapsed && "Rastreo Público"}
          </Link>
        </nav>


        <div className="p-2 border-t border-zinc-900">
          <button onClick={handleLogout} title={collapsed ? "Cerrar sesión" : undefined}
            className={`flex items-center gap-3 w-full rounded-xl text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-all duration-200
              ${collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2.5"}`}
          >
            <LogOut size={17} className="flex-shrink-0" />
            {!collapsed && "Cerrar sesión"}
          </button>
        </div>
      </aside>


      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-900 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-zinc-500 hover:text-white" onClick={() => setMobileOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="hidden sm:flex items-center bg-zinc-900 rounded-lg px-3 py-1.5 border border-zinc-800/60 focus-within:border-orange-500/40 transition-colors gap-2">
              <Search size={14} className="text-zinc-600" />
              <input type="text" placeholder="Buscar..." className="bg-transparent outline-none text-sm text-white placeholder-zinc-600 w-40" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-500 hover:text-orange-400 hover:bg-zinc-900 relative transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-black">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
