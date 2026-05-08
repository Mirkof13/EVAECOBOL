import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  Users,
  LogOut,
  Menu,
  X,
  Search,
  User,
  Bell
} from "lucide-react"
export default function Layout({ children }) {
  const { usuario, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  if (!usuario) return children
  const handleLogout = () => {
    logout()
    navigate("/login")
  }
  const menuItems = [
    {
      title: "Envios",
      path: "/",
      icon: Package,
      roles: ["EMPLEADO", "GERENTE", "ADMIN"]
    },
    {
      title: "Actualizar Estado",
      path: "/estado",
      icon: ArrowRightLeft,
      roles: ["EMPLEADO", "ADMIN"]
    },
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: ["GERENTE", "ADMIN"]
    },
    {
      title: "Usuarios",
      path: "/usuarios",
      icon: Users,
      roles: ["ADMIN"]
    }
  ]
  const navLinks = menuItems.filter(item => item.roles.includes(usuario.rol))
  return (
    <div className="min-h-screen bg-slate-950 flex overflow-hidden">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <span className="font-bold text-slate-100 text-sm tracking-wide">ECOBOL</span>
            </div>
          </div>
          <button 
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700 overflow-hidden relative group">
              <User className="text-slate-400 group-hover:hidden transition-all" size={24} />
              <img 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${usuario.nombre} ${usuario.apellido}&backgroundColor=1e3a8a`} 
                alt="Avatar" 
                className="absolute inset-0 w-full h-full object-cover hidden group-hover:block transition-all animate-fade-in"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-200">
                {usuario.nombre}
              </span>
              <span className="text-xs text-slate-500 truncate w-32">
                {usuario.email}
              </span>
              <span className="badge badge-registrado mt-1 self-start scale-90 origin-left">
                {usuario.rol}
              </span>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${active 
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
              >
                <item.icon size={18} className={active ? "text-blue-500" : "text-slate-500"} />
                {item.title}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-all duration-200"
          >
            <LogOut size={18} />
            Cerrar Sesion
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center bg-slate-800/50 rounded-lg px-3 py-1.5 border border-slate-700/50 focus-within:border-blue-500/50 transition-colors">
              <Search size={16} className="text-slate-500 mr-2" />
              <input 
                type="text" 
                placeholder="Buscar rapida..." 
                className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder-slate-500 w-48"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
