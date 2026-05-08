import { useState } from "react"
import api from "../services/api"
import { useToast } from "../context/ToastContext"
const TRANSICIONES = {
  REGISTRADO:            ["EN_TRANSITO"],
  EN_TRANSITO:           ["EN_SUCURSAL_DESTINO", "DEVUELTO"],
  EN_SUCURSAL_DESTINO:   ["EN_RUTA_ENTREGA", "DEVUELTO"],
  EN_RUTA_ENTREGA:       ["ENTREGADO", "DEVUELTO"],
  ENTREGADO:             [],
  DEVUELTO:              [],
}
const BADGE_MAP = {
  REGISTRADO:          "badge-registrado",
  EN_TRANSITO:         "badge-transito",
  EN_SUCURSAL_DESTINO: "badge-sucursal",
  EN_RUTA_ENTREGA:     "badge-ruta",
  ENTREGADO:           "badge-entregado",
  DEVUELTO:            "badge-devuelto",
}
export default function ActualizarEstado() {
  const [codigo, setCodigo] = useState("")
  const [envio, setEnvio] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [errorBusqueda, setErrorBusqueda] = useState("")
  const [nuevoEstado, setNuevoEstado] = useState("")
  const [observacion, setObservacion] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [errorUpdate, setErrorUpdate] = useState("")
  const toast = useToast()
  const buscarEnvio = async () => {
    if (!codigo.trim()) return
    setBuscando(true)
    setErrorBusqueda("")
    setEnvio(null)
    setErrorUpdate("")
    try {
      const { data } = await api.get(`/rastreo/?codigo=${codigo.trim().toUpperCase()}`)
      setEnvio(data)
      const siguientes = TRANSICIONES[data.estado_actual?.nombre] || []
      setNuevoEstado(siguientes[0] || "")
    } catch {
      setErrorBusqueda("Envío no encontrado. Verifica el código.")
    } finally {
      setBuscando(false)
    }
  }
  const handleActualizar = async () => {
    if (!nuevoEstado || !envio) return
    setGuardando(true)
    setErrorUpdate("")
    try {
      await api.patch(`/envios/${envio.id}/estado/`, {
        estado: nuevoEstado,
        observacion: observacion.trim(),
      })
      const estadoLabel = nuevoEstado.replace(/_/g, " ")
      toast.success(`Estado actualizado a "${estadoLabel}" correctamente.`)
      setObservacion("")
      const { data } = await api.get(`/rastreo/?codigo=${envio.codigo_rastreo}`)
      setEnvio(data)
      const siguientes = TRANSICIONES[data.estado_actual?.nombre] || []
      setNuevoEstado(siguientes[0] || "")
    } catch (err) {
      const msg = err.response?.data?.error || "No se pudo actualizar el estado."
      setErrorUpdate(msg)
      toast.error(msg)
    } finally {
      setGuardando(false)
    }
  }
  const estadosSiguientes = TRANSICIONES[envio?.estado_actual?.nombre] || []
  return (
    <div>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Actualizar Estado de Envío</h1>
          <p className="text-slate-500 text-sm mt-1">
            Busca el envío por su código de rastreo y avanza al siguiente estado
          </p>
        </div>
        <div className="card mb-6">
          <label className="label">Código de rastreo</label>
          <div className="flex gap-3">
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && buscarEnvio()}
              placeholder="ECO-2026-XXXXX"
              className="input flex-1 font-mono uppercase"
              maxLength={14}
            />
            <button onClick={buscarEnvio} disabled={buscando} className="btn-primary">
              {buscando ? "..." : "Buscar"}
            </button>
          </div>
          {errorBusqueda && (
            <p className="text-red-400 text-sm mt-3">{errorBusqueda}</p>
          )}
        </div>
        {envio && (
          <div className="space-y-4 animate-slide-up">
            <div className="card">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                <div>
                  <p className="font-mono text-blue-400 font-bold">{envio.codigo_rastreo}</p>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {envio.remitente_nombre} → {envio.destinatario_nombre}
                  </p>
                </div>
                <span className={`badge ${BADGE_MAP[envio.estado_actual?.nombre] || "badge-registrado"}`}>
                  {envio.estado_actual?.nombre?.replace(/_/g, " ")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500">Origen: </span>
                  <span className="text-slate-300">{envio.sucursal_origen?.nombre}</span>
                </div>
                <div>
                  <span className="text-slate-500">Destino: </span>
                  <span className="text-slate-300">{envio.sucursal_destino?.nombre}</span>
                </div>
              </div>
            </div>
            {estadosSiguientes.length > 0 ? (
              <div className="card">
                <h2 className="font-semibold text-slate-200 mb-4">Cambiar al siguiente estado</h2>
                {errorUpdate && (
                  <div className="mb-4 p-3 bg-red-900/40 border border-red-700/50 rounded-xl text-red-300 text-sm">
                    {errorUpdate}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="label">Nuevo estado *</label>
                    <div className="flex gap-2 flex-wrap">
                      {estadosSiguientes.map((est) => (
                        <button
                          key={est}
                          type="button"
                          onClick={() => setNuevoEstado(est)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                            nuevoEstado === est
                              ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                              : "bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-600"
                          }`}
                        >
                          {est.replace(/_/g, " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label">Observación (opcional)</label>
                    <textarea
                      value={observacion}
                      onChange={(e) => setObservacion(e.target.value)}
                      rows={3}
                      className="input resize-none"
                      placeholder="Ej: Paquete recibido en buenas condiciones..."
                    />
                  </div>
                  <button
                    onClick={handleActualizar}
                    disabled={guardando || !nuevoEstado}
                    className="btn-success w-full"
                  >
                    {guardando ? "Guardando..." : `Actualizar a ${nuevoEstado.replace(/_/g, " ")}`}
                  </button>
                </div>
              </div>
            ) : (
              <div className="card text-center py-6">
                <p className="text-slate-500 text-sm">
                  Este envío ya se encuentra en estado final ({envio.estado_actual?.nombre}) y no puede actualizarse.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
