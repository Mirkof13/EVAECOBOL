import { useState, useEffect, useCallback } from "react"
import TablaEnvios from "../components/TablaEnvios"
import ModalNuevoEnvio from "../components/ModalNuevoEnvio"
import ReceiptModal from "../components/ReceiptModal"
import TimelineHistorial from "../components/TimelineHistorial"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"
import { Printer } from "lucide-react"
const ESTADOS = ["REGISTRADO", "EN_TRANSITO", "EN_SUCURSAL_DESTINO", "EN_RUTA_ENTREGA", "ENTREGADO", "DEVUELTO"]
const MEDIA_BASE = import.meta.env.VITE_MEDIA_URL ?? "http://localhost:8000"
export default function GestionEnvios() {
  const { usuario } = useAuth()
  const [envios, setEnvios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [envioSeleccionado, setEnvioSeleccionado] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [sucursales, setSucursales] = useState([])
  const [pagina, setPagina] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const PAGE_SIZE = 20
  const [filtros, setFiltros] = useState({
    search: "",
    estado: "",
    sucursal_origen: "",
    desde: "",
    hasta: "",
  })
  const fetchEnvios = useCallback(async (pag = pagina) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtros.search) params.set("search", filtros.search)
      if (filtros.estado) params.set("estado_actual__nombre", filtros.estado)
      if (filtros.sucursal_origen) params.set("sucursal_origen", filtros.sucursal_origen)
      if (filtros.desde) params.set("fecha_registro__date__gte", filtros.desde)
      if (filtros.hasta) params.set("fecha_registro__date__lte", filtros.hasta)
      params.set("page", pag)
      const { data } = await api.get(`/envios/?${params}`)
      if (Array.isArray(data)) {
        setEnvios(data)
        setTotalCount(data.length)
      } else {
        setEnvios(data.results || [])
        setTotalCount(data.count || 0)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filtros, pagina])
  useEffect(() => {
    fetchEnvios()
    api.get("/sucursales/").then(({ data }) => setSucursales(data))
  }, [fetchEnvios])
  const handleFiltroChange = (e) => {
    setFiltros((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }
  const limpiarFiltros = () => {
    setPagina(1)
    setFiltros({ search: "", estado: "", sucursal_origen: "", desde: "", hasta: "" })
  }
  const irPagina = (nueva) => {
    setPagina(nueva)
    fetchEnvios(nueva)
  }
  const handleRowClick = async (envio) => {
    try {
      const { data } = await api.get(`/envios/${envio.id}/`)
      setEnvioSeleccionado(data)
    } catch (err) {
      console.error(err)
    }
  }
  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Gestion de Envios</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {usuario?.rol === "EMPLEADO"
                ? `Sucursal: ${usuario.sucursal_nombre || "No asignada"}`
                : "Vista global — todos los envios"}
            </p>
          </div>
          {(usuario?.rol === "EMPLEADO" || usuario?.rol === "ADMIN") && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              + Nuevo Envio
            </button>
          )}
        </div>
        <div className="card mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <input
              name="search"
              value={filtros.search}
              onChange={handleFiltroChange}
              placeholder="Buscar por nombre o codigo..."
              className="input col-span-2 sm:col-span-1"
            />
            <select name="estado" value={filtros.estado} onChange={handleFiltroChange} className="select">
              <option value="">Todos los estados</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e.replace(/_/g, " ")}</option>
              ))}
            </select>
            <select name="sucursal_origen" value={filtros.sucursal_origen} onChange={handleFiltroChange} className="select">
              <option value="">Todas las sucursales</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
            <input type="date" name="desde" value={filtros.desde} onChange={handleFiltroChange} className="input" />
            <input type="date" name="hasta" value={filtros.hasta} onChange={handleFiltroChange} className="input" />
          </div>
          <button onClick={limpiarFiltros} className="btn-ghost text-xs mt-3">
            Limpiar filtros
          </button>
        </div>
        <TablaEnvios
          envios={envios}
          loading={loading}
          onRowClick={handleRowClick}
        />
        {!loading && totalCount > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-slate-500">
              {totalCount} envío{totalCount !== 1 ? "s" : ""} en total
              {totalCount > PAGE_SIZE && ` — página ${pagina} de ${Math.ceil(totalCount / PAGE_SIZE)}`}
            </p>
            {totalCount > PAGE_SIZE && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => irPagina(pagina - 1)}
                  disabled={pagina <= 1}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Anterior
                </button>
                <span className="text-xs text-slate-500 px-2">
                  {pagina} / {Math.ceil(totalCount / PAGE_SIZE)}
                </span>
                <button
                  onClick={() => irPagina(pagina + 1)}
                  disabled={pagina >= Math.ceil(totalCount / PAGE_SIZE)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {showReceipt && envioSeleccionado && (
        <ReceiptModal
          envio={envioSeleccionado}
          onClose={() => setShowReceipt(false)}
        />
      )}
      {showModal && (
        <ModalNuevoEnvio
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            fetchEnvios()
          }}
        />
      )}
      
      {envioSeleccionado && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEnvioSeleccionado(null)}
          />
          <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-screen overflow-y-auto shadow-2xl animate-slide-left flex flex-col">
            <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-6 flex items-center justify-between flex-shrink-0">
              <div>
                <p className="font-mono text-blue-400 font-bold text-xl leading-none">
                  {envioSeleccionado.codigo_rastreo}
                </p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">Detalle del envio</p>
              </div>
              <button 
                onClick={() => setEnvioSeleccionado(null)} 
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-8">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-slate-500 text-xs uppercase">Remitente</p>
                    <p className="text-slate-200">{envioSeleccionado.remitente_nombre}</p>
                    <p className="text-slate-400 text-xs">{envioSeleccionado.remitente_telefono}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase">Destinatario</p>
                    <p className="text-slate-200">{envioSeleccionado.destinatario_nombre}</p>
                    <p className="text-slate-400 text-xs">{envioSeleccionado.destinatario_telefono}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-slate-500 text-xs uppercase">Peso</p>
                    <p className="text-slate-200">{envioSeleccionado.peso_kg} kg</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase">Precio</p>
                    <p className="text-emerald-400 font-bold">Bs. {parseFloat(envioSeleccionado.precio_bs).toFixed(2)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase">Descripción</p>
                  <p className="text-slate-300">{envioSeleccionado.descripcion || "Sin descripción"}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReceipt(true)}
                    className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                  >
                    <Printer size={18} /> Imprimir Recibo
                  </button>
                </div>
              </div>

              <div className="px-6 pb-8 space-y-8">
                {envioSeleccionado.foto_envio && (
                  <div className="border-t border-slate-800 pt-8">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                      Foto del Envío
                    </h3>
                    <img
                      src={`${MEDIA_BASE}${envioSeleccionado.foto_envio}`}
                      alt="Foto del envío"
                      className="w-full rounded-2xl object-cover max-h-64 border border-slate-700 shadow-xl"
                    />
                  </div>
                )}
                <div className="border-t border-slate-800 pt-8">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6">
                    Historial de Estados
                  </h3>
                  <TimelineHistorial historial={envioSeleccionado.historial || []} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
