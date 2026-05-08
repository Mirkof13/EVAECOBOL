import { useEffect, useState } from "react"
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title,
} from "chart.js"
import { Doughnut, Bar } from "react-chartjs-2"
import jsPDF from "jspdf"
import api from "../services/api"
import { useToast } from "../context/ToastContext"
import MapaBolivia from "../components/MapaBolivia"
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)
const ESTADO_COLORS = {
  REGISTRADO:            "#475569",
  EN_TRANSITO:           "#3b82f6",
  EN_SUCURSAL_DESTINO:   "#8b5cf6",
  EN_RUTA_ENTREGA:       "#f59e0b",
  ENTREGADO:             "#10b981",
  DEVUELTO:              "#ef4444",
}
function StatCard({ label, value, sub, color = "text-slate-100" }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className={`stat-value ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  )
}
export default function DashboardGerente() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [csvFiltros, setCsvFiltros] = useState({ desde: "", hasta: "", estado: "" })
  const toast = useToast()
  useEffect(() => {
    api.get("/estadisticas/")
      .then(({ data }) => setStats(data))
      .catch(() => setError("No se pudieron cargar las estadísticas."))
      .finally(() => setLoading(false))
  }, [])
  const descargarCSV = () => {
    const params = new URLSearchParams()
    if (csvFiltros.desde) params.set("desde", csvFiltros.desde)
    if (csvFiltros.hasta) params.set("hasta", csvFiltros.hasta)
    if (csvFiltros.estado) params.set("estado", csvFiltros.estado)
    const token = localStorage.getItem("access")
    if (token) params.set("token", token)
    window.open(`${api.defaults.baseURL}/reportes/csv/?${params}`, "_blank")
    toast.info("Generando reporte CSV...")
  }
  const exportarPDF = () => {
    if (!stats) return
    const doc = new jsPDF()
    const fecha = new Date().toLocaleDateString("es-BO", {
      day: "2-digit", month: "long", year: "numeric",
    })
    doc.setFillColor(29, 78, 216)
    doc.rect(0, 0, 210, 28, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("ECOBOL", 14, 12)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Agencia Boliviana de Correos — Reporte Estadístico", 14, 20)
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(9)
    doc.text(`Generado el: ${fecha}`, 14, 36)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Resumen de Métricas", 14, 48)
    const metricas = [
      ["Envíos registrados hoy",   String(stats.total_hoy)],
      ["Envíos del mes en curso",  String(stats.total_mes)],
      ["Entregas exitosas",        `${stats.porcentaje_exitosas}%`],
      ["Envíos retrasados (+48h)", String(stats.retrasados || 0)],
    ]
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    metricas.forEach(([label, valor], i) => {
      const y = 58 + i * 10
      doc.setTextColor(80, 80, 80)
      doc.text(label, 14, y)
      doc.setTextColor(29, 78, 216)
      doc.setFont("helvetica", "bold")
      doc.text(valor, 140, y)
      doc.setFont("helvetica", "normal")
    })
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Distribución por Estado", 14, 108)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    stats.por_estado.forEach((e, i) => {
      const nombre = (e["estado_actual__nombre"] || "").replace(/_/g, " ")
      doc.setTextColor(80, 80, 80)
      doc.text(nombre, 14, 118 + i * 9)
      doc.setTextColor(0, 0, 0)
      doc.text(String(e.total), 160, 118 + i * 9)
    })
    const yBase = 118 + stats.por_estado.length * 9 + 14
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Top Sucursales del Mes", 14, yBase)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    stats.por_sucursal.slice(0, 5).forEach((s, i) => {
      const nombre = (s["sucursal_origen__nombre"] || "").replace("Sucursal ", "")
      doc.setTextColor(80, 80, 80)
      doc.text(nombre, 14, yBase + 10 + i * 9)
      doc.setTextColor(0, 0, 0)
      doc.text(`${s.total} envíos`, 160, yBase + 10 + i * 9)
    })
    doc.setDrawColor(200, 200, 200)
    doc.line(14, 270, 196, 270)
    doc.setTextColor(150, 150, 150)
    doc.setFontSize(8)
    doc.text("ECOBOL — Sistema de Gestión de Envíos Postales | Confidencial", 14, 278)
    doc.text(`Pág. 1`, 190, 278)
    doc.save(`reporte_ecobol_${new Date().toISOString().slice(0, 10)}.pdf`)
    toast.success("PDF generado correctamente.")
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="flex gap-2">
          {[0,1,2].map(i => (
            <div key={i} className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }
  const estadosLabels = stats.por_estado.map(e =>
    (e["estado_actual__nombre"] || "").replace(/_/g, " ")
  )
  const estadosTotales = stats.por_estado.map(e => e.total)
  const estadosColors = stats.por_estado.map(e =>
    ESTADO_COLORS[e["estado_actual__nombre"]] || "#64748b"
  )
  const donaData = {
    labels: estadosLabels,
    datasets: [{
      data: estadosTotales,
      backgroundColor: estadosColors,
      borderColor: estadosColors.map(c => c + "80"),
      borderWidth: 2,
    }],
  }
  const sucursalesLabels = stats.por_sucursal.map(s =>
    (s["sucursal_origen__nombre"] || "").replace("Sucursal ", "")
  )
  const barData = {
    labels: sucursalesLabels,
    datasets: [{
      label: "Envíos del mes",
      data: stats.por_sucursal.map(s => s.total),
      backgroundColor: "#3b82f680",
      borderColor: "#3b82f6",
      borderWidth: 2,
      borderRadius: 8,
    }],
  }
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#94a3b8", font: { size: 12 } } },
    },
  }
  const barOptions = {
    ...chartOptions,
    scales: {
      y: { ticks: { color: "#64748b" }, grid: { color: "#1e293b" } },
      x: { ticks: { color: "#64748b" }, grid: { color: "#1e293b" } },
    },
  }
  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Panel de Control</h1>
            <p className="text-slate-500 text-sm mt-0.5">Estadísticas en tiempo real
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn-ghost text-sm"
          >
            Actualizar
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Envíos hoy"
            value={stats.total_hoy}
            sub="en el día de hoy"
          />
          <StatCard
            label="Envíos este mes"
            value={stats.total_mes}
            sub="desde el 1ro del mes"
          />
          <StatCard
            label="Entregas exitosas"
            value={`${stats.porcentaje_exitosas}%`}
            color="text-emerald-400"
            sub="del total del mes"
          />
          <StatCard
            label="Envíos retrasados"
            value={stats.retrasados || 0}
            color={stats.retrasados > 0 ? "text-red-400" : "text-slate-100"}
            sub="+48h sin actualización"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Distribución por Estado
            </h2>
            {estadosTotales.length > 0 ? (
              <div className="max-w-xs mx-auto">
                <Doughnut data={donaData} options={chartOptions} />
              </div>
            ) : (
              <p className="text-center text-slate-600 py-8 text-sm">Sin datos disponibles.</p>
            )}
          </div>
          <div className="card">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Top 5 Sucursales del Mes
            </h2>
            {sucursalesLabels.length > 0 ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <p className="text-center text-slate-600 py-8 text-sm">Sin datos disponibles.</p>
            )}
          </div>
        </div>
        <div className="mb-8">
          <MapaBolivia datos={stats.por_sucursal} />
        </div>
        <div className="card">
          <h2 className="font-semibold text-slate-200 mb-1">Exportar Reporte CSV
          <p className="text-slate-500 text-sm mb-5">
            Filtra y descarga el reporte de envíos en formato CSV compatible con Excel.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="label">Desde</label>
              <input
                type="date"
                value={csvFiltros.desde}
                onChange={(e) => setCsvFiltros(p => ({ ...p, desde: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Hasta</label>
              <input
                type="date"
                value={csvFiltros.hasta}
                onChange={(e) => setCsvFiltros(p => ({ ...p, hasta: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Estado</label>
              <select
                value={csvFiltros.estado}
                onChange={(e) => setCsvFiltros(p => ({ ...p, estado: e.target.value }))}
                className="select"
              >
                <option value="">Todos</option>
                {["REGISTRADO","EN_TRANSITO","EN_SUCURSAL_DESTINO","EN_RUTA_ENTREGA","ENTREGADO","DEVUELTO"].map(e => (
                  <option key={e} value={e}>{e.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
                <div className="flex flex-col gap-2">
                <button onClick={descargarCSV} className="btn-success w-full">
                  Descargar CSV
                </button>
                <button onClick={exportarPDF} className="btn-primary w-full">
                  Exportar PDF
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Sin filtros: exporta todos los envíos del mes en curso.
          </p>
        </div>
      </main>
    </div>
  )
}
