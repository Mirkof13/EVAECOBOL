import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import api from "../services/api"
import TimelineHistorial from "../components/TimelineHistorial"
import ecobolLogo from "../assets/logos/ecobol_logo.png"

const BADGE_MAP = {
  REGISTRADO:          "badge-registrado",
  EN_TRANSITO:         "badge-transito",
  EN_SUCURSAL_DESTINO: "badge-sucursal",
  EN_RUTA_ENTREGA:     "badge-ruta",
  ENTREGADO:           "badge-entregado",
  DEVUELTO:            "badge-devuelto",
}

function InfoRow({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-zinc-500 uppercase tracking-wider">{label}</dt>
      <dd className="text-sm font-medium text-white mt-0.5">{value || "—"}</dd>
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
    setError(""); setResultado(null); setCargando(true)
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
    const p = searchParams.get("codigo")
    if (p) { const u = p.toUpperCase(); setCodigo(u); buscarPorCodigo(u) }
  }, []) // eslint-disable-line

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-zinc-950 border-b border-zinc-900">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <img src={ecobolLogo} alt="ECOBOL" className="h-9 object-contain" />
          <a href="/login" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">Portal empleados →</a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-5">
            <div className="absolute inset-0 bg-orange-500/15 rounded-full blur-2xl animate-pulse-slow" />
            <svg className="w-full h-full text-orange-500 drop-shadow-xl animate-float" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
              <path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Rastrea tu Envío</h1>
          <p className="text-zinc-500 text-sm">
            Ingresa el código de rastreo de tu comprobante.{" "}
            <span className="font-mono text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded text-xs">ECO-2026-XXXXX</span>
          </p>
        </div>

        <div className="flex gap-3">
          <input value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && buscarPorCodigo()}
            placeholder="ECO-2026-A3F9C" className="input flex-1 font-mono uppercase text-lg tracking-widest"
            maxLength={14} autoFocus={!searchParams.get("codigo")} />
          <button onClick={() => buscarPorCodigo()} disabled={cargando} className="btn-primary px-8">
            {cargando ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Buscar"}
          </button>
        </div>

        {error && <p className="mt-4 text-red-400 text-sm animate-fade-in">{error}</p>}

        {resultado && (
          <div className="mt-8 space-y-6 animate-slide-up">
            <div className="card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <span className="font-mono text-orange-400 font-bold text-lg">{resultado.codigo_rastreo}</span>
                  <p className="text-sm text-zinc-500 mt-1">
                    De: <span className="text-zinc-200">{resultado.remitente_nombre}</span>
                    {" → "}Para: <span className="text-zinc-200">{resultado.destinatario_nombre}</span>
                  </p>
                </div>
                <span className={`badge text-sm ${BADGE_MAP[resultado.estado_actual?.nombre] || "badge-registrado"}`}>
                  {resultado.estado_actual?.nombre?.replace(/_/g, " ")}
                </span>
              </div>
              <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-zinc-800">
                <InfoRow label="Origen"  value={resultado.sucursal_origen?.nombre} />
                <InfoRow label="Destino" value={resultado.sucursal_destino?.nombre} />
                <InfoRow label="Peso"    value={`${resultado.peso_kg} kg`} />
                <InfoRow label="Entrega estimada" value={resultado.fecha_estimada
                  ? new Date(resultado.fecha_estimada + "T12:00:00").toLocaleDateString("es-BO", { day: "2-digit", month: "long", year: "numeric" })
                  : "No especificada"} />
              </dl>
            </div>
            <div className="card">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-5">Historial de Estados</h2>
              <TimelineHistorial historial={resultado.historial} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
