import { useState, useEffect, useCallback } from "react"
import api from "../services/api"
import { useToast } from "../context/ToastContext"
const DEPARTAMENTOS = [
  "La Paz", "Santa Cruz", "Cochabamba", "Oruro",
  "Potosi", "Sucre", "Tarija", "Trinidad", "Cobija",
]
const FORM_VACIO = {
  nombre: "", departamento: "La Paz", ciudad: "",
  direccion: "", telefono: "", activa: true,
}
export default function GestionSucursales() {
  const [sucursales, setSucursales] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState("")
  const toast = useToast()
  const fetchSucursales = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get("/sucursales/admin/")
      setSucursales(Array.isArray(data) ? data : data.results || [])
    } catch {
      toast.error("No se pudieron cargar las sucursales.")
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => { fetchSucursales() }, [fetchSucursales])
  const abrirFormNuevo = () => {
    setEditando(null)
    setForm(FORM_VACIO)
    setError("")
    setShowForm(true)
  }
  const abrirFormEditar = (s) => {
    setEditando(s.id)
    setForm({
      nombre: s.nombre,
      departamento: s.departamento,
      ciudad: s.ciudad,
      direccion: s.direccion,
      telefono: s.telefono || "",
      activa: s.activa,
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
        await api.patch(`/sucursales/admin/${editando}/`, form)
        toast.success("Sucursal actualizada correctamente.")
      } else {
        await api.post("/sucursales/admin/", form)
        toast.success("Sucursal creada correctamente.")
      }
      fetchSucursales()
      setShowForm(false)
    } catch (err) {
      const msg = err.response?.data
      if (typeof msg === "object") {
        const first = Object.values(msg)[0]
        const texto = Array.isArray(first) ? first[0] : JSON.stringify(msg)
        setError(texto)
        toast.error(texto)
      } else {
        setError("Error al guardar la sucursal.")
        toast.error("Error al guardar la sucursal.")
      }
    } finally {
      setGuardando(false)
    }
  }
  const toggleActiva = async (s) => {
    try {
      await api.patch(`/sucursales/admin/${s.id}/`, { activa: !s.activa })
      toast.info(`Sucursal ${s.activa ? "desactivada" : "activada"}.`)
      fetchSucursales()
    } catch {
      toast.error("Error al cambiar el estado de la sucursal.")
    }
  }
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Gestión de Sucursales</h1>
          <p className="text-slate-500 text-sm mt-0.5">Gestión de oficinas y centros de distribución</p>
        </div>
        <button onClick={abrirFormNuevo} className="btn-primary">
          + Nueva Sucursal
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
                <th className="table-header text-left">Sucursal</th>
                <th className="table-header text-left">Departamento</th>
                <th className="table-header text-left">Ciudad</th>
                <th className="table-header text-left">Dirección</th>
                <th className="table-header text-left">Teléfono</th>
                <th className="table-header text-center">Estado</th>
                <th className="table-header text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sucursales.map((s) => (
                <tr key={s.id} className="table-row">
                  <td className="table-cell font-medium text-slate-200">{s.nombre}</td>
                  <td className="table-cell">
                    <span className="badge badge-transito">{s.departamento}</span>
                  </td>
                  <td className="table-cell text-slate-400">{s.ciudad}</td>
                  <td className="table-cell text-slate-500 text-xs max-w-xs truncate">{s.direccion}</td>
                  <td className="table-cell text-slate-400">{s.telefono || "—"}</td>
                  <td className="table-cell text-center">
                    <span className={`badge ${s.activa
                      ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50"
                      : "bg-slate-800 text-slate-500"
                    }`}>
                      {s.activa ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => abrirFormEditar(s)}
                        className="btn-ghost text-xs px-3 py-1.5">
                        Editar
                      </button>
                      <button
                        onClick={() => toggleActiva(s)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                          s.activa
                            ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                            : "bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50"
                        }`}
                      >
                        {s.activa ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sucursales.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              No hay sucursales registradas.
            </div>
          )}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg card animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-100">
                {editando ? "Editar Sucursal" : "Nueva Sucursal"}
              </h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost w-8 h-8 p-0">✕</button>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-900/40 border border-red-700/50 rounded-xl text-red-300 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nombre de la sucursal *</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm(p => ({ ...p, nombre: e.target.value }))}
                  required className="input" placeholder="Sucursal Central La Paz"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Departamento *</label>
                  <select
                    value={form.departamento}
                    onChange={(e) => setForm(p => ({ ...p, departamento: e.target.value }))}
                    className="select" required
                  >
                    {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Ciudad *</label>
                  <input
                    value={form.ciudad}
                    onChange={(e) => setForm(p => ({ ...p, ciudad: e.target.value }))}
                    required className="input" placeholder="La Paz"
                  />
                </div>
              </div>
              <div>
                <label className="label">Dirección *</label>
                <input
                  value={form.direccion}
                  onChange={(e) => setForm(p => ({ ...p, direccion: e.target.value }))}
                  required className="input" placeholder="Av. Mariscal Santa Cruz 1234"
                />
              </div>
              <div>
                <label className="label">Teléfono</label>
                <input
                  value={form.telefono}
                  onChange={(e) => setForm(p => ({ ...p, telefono: e.target.value }))}
                  className="input" placeholder="22123456"
                />
              </div>
              {editando && (
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                  <input type="checkbox" id="activa"
                    checked={form.activa}
                    onChange={(e) => setForm(p => ({ ...p, activa: e.target.checked }))}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <label htmlFor="activa" className="text-sm text-slate-300 cursor-pointer">
                    Sucursal activa (visible para asignar envíos)
                  </label>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="btn-primary flex-1">
                  {guardando ? "Guardando..." : editando ? "Guardar Cambios" : "Crear Sucursal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
