import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import api from "../services/api"
import TimelineHistorial from "../components/TimelineHistorial"
const BADGE_MAP = {
  REGISTRADO:            "badge-registrado",
  EN_TRANSITO:           "badge-transito",
  EN_SUCURSAL_DESTINO:   "badge-sucursal",
  EN_RUTA_ENTREGA:       "badge-ruta",
  ENTREGADO:             "badge-entregado",
  DEVUELTO:              "badge-devuelto",
}
function InfoRow({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-slate-500 uppercase tracking-wider">{label}</dt>
      <dd className="text-sm font-medium text-slate-200 mt-0.5">{value || "—"}</dd>
    </div>
  )
}
export default function RastreoPublico() {
  const [searchParams] = useSearchParams()
  const [codigo, setCodigo] = useState("")
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState("")
  const [cargando, setCargando] = useState(false)
  const buscarPorCodigo = useCallback(async (codigoBuscar) => {
    const term = (codigoBuscar || codigo).trim().toUpperCase()
    if (!term) { setError("Ingresa el código de rastreo."); return }
    setError("")
    setResultado(null)
    setCargando(true)
    try {
      const { data } = await api.get(`/rastreo/?codigo=${term}`)
      setResultado(data)
    } catch {
      setError("Código no encontrado. Verifica el código en tu comprobante.")
    } finally {
      setCargando(false)
    }
  }, [codigo])
  useEffect(() => {
    const codigoParam = searchParams.get("codigo")
    if (codigoParam) {
      const upper = codigoParam.toUpperCase()
      setCodigo(upper)
      buscarPorCodigo(upper)
    }
  }, []) 
  const handleKey = (e) => {
    if (e.key === "Enter") buscarPorCodigo()
  }
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <p className="font-bold text-slate-100 text-sm">ECOBOL</p>
              <p className="text-xs text-slate-500">Rastreo de Envíos</p>
            </div>
          </div>
          <a href="/login" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            Portal empleados →
          </a>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse-slow" />
            <svg 
              className="w-full h-full text-blue-500 drop-shadow-xl animate-float"
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="m7.5 4.27 9 5.15" />
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-100 mb-2">Rastrea tu Envío</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Ingresa el código de rastreo que recibiste al momento del envío.
            <br />
            <span className="text-xs text-slate-500 font-mono mt-2 inline-block bg-slate-800/50 px-2 py-1 rounded">Ejemplo: ECO-2026-A3F9C</span>
          </p>
        </div>
        <div className="flex gap-3">
          <input
            id="codigo-rastreo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            onKeyDown={handleKey}
            placeholder="ECO-2026-A3F9C"
            className="input flex-1 font-mono uppercase text-lg tracking-widest"
            maxLength={14}
            autoFocus={!searchParams.get("codigo")}
          />
          <button
            onClick={() => buscarPorCodigo()}
            disabled={cargando}
            className="btn-primary px-8"
          >
            {cargando ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : "Buscar"}
          </button>
        </div>
        {error && (
          <p className="mt-4 text-red-400 text-sm animate-fade-in">{error}</p>
        )}
        {resultado && (
          <div className="mt-8 space-y-6 animate-slide-up">
            <div className="card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <span className="font-mono text-blue-400 font-bold text-lg">
                    {resultado.codigo_rastreo}
                  </span>
                  <p className="text-sm text-slate-400 mt-1">
                    De: <span className="text-slate-200">{resultado.remitente_nombre}</span>
                    {" → "}
                    Para: <span className="text-slate-200">{resultado.destinatario_nombre}</span>
                  </p>
                </div>
                <span className={`badge text-sm ${BADGE_MAP[resultado.estado_actual?.nombre] || "badge-registrado"}`}>
                  {resultado.estado_actual?.nombre?.replace(/_/g, " ")}
                </span>
              </div>
              <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-slate-800">
                <InfoRow label="Origen" value={resultado.sucursal_origen?.nombre} />
                <InfoRow label="Destino" value={resultado.sucursal_destino?.nombre} />
                <InfoRow label="Peso" value={`${resultado.peso_kg} kg`} />
                <InfoRow
                  label="Entrega estimada"
                  value={resultado.fecha_estimada
                    ? new Date(resultado.fecha_estimada + "T12:00:00").toLocaleDateString("es-BO", {
                        day: "2-digit", month: "long", year: "numeric",
                      })
                    : "No especificada"
                  }
                />
              </dl>
            </div>
            <div className="card">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">
                Historial de Estados
              </h2>
              <TimelineHistorial historial={resultado.historial} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
