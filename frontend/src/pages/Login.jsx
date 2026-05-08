import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import ImageCarousel from "../components/ImageCarousel"
export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [cargando, setCargando] = useState(false)
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setCargando(true)
    try {
      const perfil = await login(email, password)
      toast.success(`Bienvenido, ${perfil.nombre}!`)
      if (perfil.rol === "GERENTE") navigate("/dashboard")
      else if (perfil.rol === "ADMIN") navigate("/usuarios")
      else navigate("/")
    } catch (err) {
      const msg = err.response?.data?.detail
      if (msg?.includes("suspendida") || msg?.includes("disabled")) {
        setError("Cuenta suspendida. Contacte al administrador.")
      } else {
        setError("Email o contraseña incorrectos.")
      }
    } finally {
      setCargando(false)
    }
  }
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div className="hidden lg:block lg:w-[55%] xl:w-[60%] relative">
        <ImageCarousel />
      </div>
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl animate-pulse-slow"
            style={{ animationDelay: "1.5s" }} />
        </div>
        <div className="relative w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mb-4 shadow-2xl shadow-blue-500/30">
              <span className="text-white font-black text-2xl">E</span>
            </div>
            <h1 className="text-3xl font-black text-slate-100">ECOBOL</h1>
            <p className="text-slate-400 mt-1 text-sm">Agencia Boliviana de Correos</p>
          </div>
          <div className="card-glass">
            <h2 className="text-lg font-semibold text-slate-200 mb-6">Iniciar Sesión</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-900/40 border border-red-700/50 rounded-xl text-red-300 text-sm animate-fade-in">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="label">Correo electrónico</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="usuario@ecobol.bo"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="password" className="label">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                disabled={cargando}
                className="btn-primary w-full mt-2"
              >
                {cargando ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Ingresando...
                  </span>
                ) : "Ingresar al Sistema"}
              </button>
            </form>
            <div className="mt-6 pt-4 border-t border-slate-700/50 text-center">
              <a
                href="/rastreo"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Consultar envío por código de rastreo →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
