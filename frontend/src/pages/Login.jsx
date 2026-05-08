import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import ImageCarousel from "../components/ImageCarousel"
import { Eye, EyeOff } from "lucide-react"
import ecobolLogo from "../assets/logos/ecobol_logo.png"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
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
      setError(msg?.includes("suspendida") ? "Cuenta suspendida. Contacte al administrador." : "Email o contraseña incorrectos.")
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      <div className="hidden lg:block lg:w-[58%] relative overflow-hidden">
        <ImageCarousel />
      </div>

      <div className="flex-1 flex items-center justify-center p-8 relative bg-black overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600/4 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-sm animate-slide-up">
          <div className="flex flex-col items-center mb-10">
            <img src={ecobolLogo} alt="ECOBOL" className="h-16 object-contain mb-4" />
            <p className="text-zinc-500 text-sm text-center">Sistema de Gestión Postal</p>
          </div>

          <div className="card-glass">
            <h2 className="text-lg font-semibold text-white mb-6">Iniciar sesión</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-950/60 border border-red-800/50 rounded-xl text-red-300 text-sm animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Correo electrónico</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input" placeholder="usuario@ecobol.bo" required autoComplete="email" />
              </div>

              <div>
                <label className="label">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-11"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={cargando} className="btn-primary w-full mt-2">
                {cargando ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Ingresando...
                  </span>
                ) : "Ingresar al Sistema"}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-white/5 text-center">
              <a href="/rastreo" className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
                Consultar envío sin iniciar sesión →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
