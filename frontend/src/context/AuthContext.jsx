import { createContext, useContext, useState } from "react"
import api from "../services/api"
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const stored = localStorage.getItem("usuario")
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const login = async (email, password) => {
    const { data } = await api.post("/auth/token/", { email, password })
    localStorage.setItem("access", data.access)
    localStorage.setItem("refresh", data.refresh)
    const perfil = data.usuario
    localStorage.setItem("usuario", JSON.stringify(perfil))
    setUsuario(perfil)
    return perfil
  }
  const logout = async () => {
    const refresh = localStorage.getItem("refresh")
    if (refresh) {
      try {
        await api.post("/auth/logout/", { refresh })
      } catch {
      }
    }
    localStorage.clear()
    setUsuario(null)
  }
  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => useContext(AuthContext)
