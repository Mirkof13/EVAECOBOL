import { useState, useEffect, useCallback } from "react"
import api from "../services/api"
import { useToast } from "../context/ToastContext"
const ROLES = ["EMPLEADO", "GERENTE", "ADMIN"]
const ROL_BADGE = {
  ADMIN:    "bg-red-900/60 text-red-300 border border-red-700/50",
  GERENTE:  "bg-violet-900/60 text-violet-300 border border-violet-700/50",
  EMPLEADO: "bg-blue-900/60 text-blue-300 border border-blue-700/50",
}
const FORM_VACIO = {
  nombre: "", apellido: "", email: "", password: "",
  rol: "EMPLEADO", sucursal: "", activo: true,
}
export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [sucursales, setSucursales] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState("")
  const toast = useToast()
  const fetchUsuarios = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get("/usuarios/")
      setUsuarios(Array.isArray(data) ? data : data.results || [])
    } catch {
      toast.error("No se pudieron cargar los usuarios.")
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    fetchUsuarios()
    api.get("/sucursales/").then(({ data }) => setSucursales(data))
  }, [fetchUsuarios])
  const abrirFormNuevo = () => {
    setEditando(null)
    setForm(FORM_VACIO)
    setError("")
    setShowForm(true)
  }
  const abrirFormEditar = (u) => {
    setEditando(u.id)
    setForm({
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      password: "",
      rol: u.rol,
      sucursal: u.sucursal || "",
      activo: u.activo,
    })
    setError("")
    setShowForm(true)
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError("")
    try {
      if (editando) {
        const payload = { nombre: form.nombre, apellido: form.apellido, email: form.email, rol: form.rol, activo: form.activo }
        if (form.sucursal) payload.sucursal = form.sucursal
        await api.patch(`/usuarios/${editando}/`, payload)
        toast.success("Usuario actualizado correctamente.")
      } else {
        const payload = { ...form }
        if (!payload.sucursal) delete payload.sucursal
        await api.post("/usuarios/", payload)
        toast.success("Usuario creado correctamente.")
      }
      fetchUsuarios()
      setShowForm(false)
    } catch (err) {
      const msg = err.response?.data
      if (typeof msg === "object") {
        const first = Object.values(msg)[0]
        const texto = Array.isArray(first) ? first[0] : JSON.stringify(msg)
        setError(texto)
        toast.error(texto)
      } else {
        setError("Error al guardar el usuario.")
        toast.error("Error al guardar el usuario.")
      }
    } finally {
      setGuardando(false)
    }
  }
  const toggleActivo = async (u) => {
    try {
      await api.patch(`/usuarios/${u.id}/`, { activo: !u.activo })
      toast.info(`Usuario ${u.activo ? "desactivado" : "activado"}.`)
      fetchUsuarios()
    } catch {
      toast.error("Error al cambiar el estado del usuario.")
    }
  }
  return (
    <div>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Administración del personal y roles del sistema</p>
          </div>
          <button onClick={abrirFormNuevo} className="btn-primary">
            + Nuevo Usuario
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex gap-2">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header text-left">Nombre</th>
                  <th className="table-header text-left">Email</th>
                  <th className="table-header text-left">Rol</th>
                  <th className="table-header text-left">Sucursal</th>
                  <th className="table-header text-center">Estado</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="table-row">
                    <td className="table-cell font-medium text-zinc-100">
                      {u.nombre} {u.apellido}
                    </td>
                    <td className="table-cell text-zinc-400">{u.email}</td>
                    <td className="table-cell">
                      <span className={`badge ${ROL_BADGE[u.rol] || "badge-registrado"}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="table-cell text-zinc-400">
                      {u.sucursal_detalle?.nombre || "—"}
                    </td>
                    <td className="table-cell text-center">
                      <span className={`badge ${u.activo
                        ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50"
                        : "bg-slate-800 text-zinc-500"
                      }`}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => abrirFormEditar(u)}
                          className="btn-ghost text-xs px-3 py-1.5"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => toggleActivo(u)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                            u.activo
                              ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                              : "bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50"
                          }`}
                        >
                          {u.activo ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {usuarios.length === 0 && (
              <div className="text-center py-12 text-zinc-500 text-sm">
                No hay usuarios registrados.
              </div>
            )}
          </div>
        )}
      </main>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg card animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                {editando ? "Editar Usuario" : "Crear Nuevo Usuario"}
              </h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost w-8 h-8 p-0">✕</button>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-900/40 border border-red-700/50 rounded-xl text-red-300 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nombre *</label>
                  <input
                    value={form.nombre}
                    onChange={(e) => setForm(p => ({ ...p, nombre: e.target.value }))}
                    required className="input" placeholder="Juan"
                  />
                </div>
                <div>
                  <label className="label">Apellido *</label>
                  <input
                    value={form.apellido}
                    onChange={(e) => setForm(p => ({ ...p, apellido: e.target.value }))}
                    required className="input" placeholder="Quispe"
                  />
                </div>
              </div>
              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  required className="input" placeholder="usuario@ecobol.bo"
                />
              </div>
              {!editando && (
                <div>
                  <label className="label">Contraseña temporal *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                    required minLength={6} className="input" placeholder="Mínimo 6 caracteres"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Rol *</label>
                  <select
                    value={form.rol}
                    onChange={(e) => setForm(p => ({ ...p, rol: e.target.value }))}
                    className="select"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Sucursal</label>
                  <select
                    value={form.sucursal}
                    onChange={(e) => setForm(p => ({ ...p, sucursal: e.target.value }))}
                    className="select"
                  >
                    <option value="">Sin sucursal</option>
                    {sucursales.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              {editando && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={form.activo}
                    onChange={(e) => setForm(p => ({ ...p, activo: e.target.checked }))}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <label htmlFor="activo" className="text-sm text-zinc-300">Cuenta activa</label>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="btn-primary flex-1">
                  {guardando ? "Guardando..." : editando ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
