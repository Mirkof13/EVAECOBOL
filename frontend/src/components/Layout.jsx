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
  Bell,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
export default function Layout({ children }) {
  const { usuario, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
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
        className={`fixed lg:static inset-y-0 left-0 z-50 ${isCollapsed ? "lg:w-20" : "lg:w-64"} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="h-16 flex items-center px-4 lg:px-6 border-b border-slate-800">
          <div className={`flex items-center gap-3 transition-opacity duration-300 ${isCollapsed ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100"}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-slate-100 text-sm tracking-wide whitespace-nowrap">ECOBOL</span>
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex ml-auto p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <button 
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className={`p-4 lg:p-6 border-b border-slate-800 transition-all duration-300 ${isCollapsed ? "lg:px-4" : ""}`}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700 overflow-hidden relative group flex-shrink-0">
              <User className="text-slate-400 group-hover:hidden transition-all" size={20} />
              <img 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${usuario.nombre} ${usuario.apellido}&backgroundColor=1e3a8a`} 
                alt="Avatar" 
                className="absolute inset-0 w-full h-full object-cover hidden group-hover:block transition-all animate-fade-in"
              />
            </div>
            <div className={`flex flex-col transition-opacity duration-300 ${isCollapsed ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100"}`}>
              <span className="text-sm font-semibold text-slate-200 whitespace-nowrap">
                {usuario.nombre}
              </span>
              <span className="text-xs text-slate-500 truncate w-32">
                {usuario.email}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 lg:px-4 py-6 space-y-1 overflow-y-auto">
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
                  } ${isCollapsed ? "lg:justify-center" : ""}`}
              >
                <item.icon size={18} className={`${active ? "text-blue-500" : "text-slate-500"} flex-shrink-0`} />
                <span className={`transition-opacity duration-300 ${isCollapsed ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100"}`}>
                  {item.title}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-all duration-200 ${isCollapsed ? "lg:justify-center" : ""}`}
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span className={`transition-opacity duration-300 ${isCollapsed ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100"}`}>
              Cerrar Sesion
            </span>
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
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
          <div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
