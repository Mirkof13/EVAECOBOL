import { 
  Package, 
  Truck, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  XCircle,
  Clock
} from "lucide-react"
const ICONS_MAP = {
  REGISTRADO: Package,
  EN_TRANSITO: Truck,
  EN_SUCURSAL_DESTINO: MapPin,
  EN_RUTA_ENTREGA: Navigation,
  ENTREGADO: CheckCircle2,
  DEVUELTO: XCircle,
}
const COLOR_MAP = {
  REGISTRADO: "text-blue-500 border-blue-500 shadow-blue-500/30",
  EN_TRANSITO: "text-amber-500 border-amber-500 shadow-amber-500/30",
  EN_SUCURSAL_DESTINO: "text-indigo-500 border-indigo-500 shadow-indigo-500/30",
  EN_RUTA_ENTREGA: "text-purple-500 border-purple-500 shadow-purple-500/30",
  ENTREGADO: "text-emerald-500 border-emerald-500 shadow-emerald-500/30",
  DEVUELTO: "text-red-500 border-red-500 shadow-red-500/30",
}
function formatFecha(isoStr) {
  if (!isoStr) return "—"
  const date = new Date(isoStr)
  return {
    fecha: date.toLocaleDateString("es-BO", { day: "2-digit", month: "long", year: "numeric" }),
    hora: date.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })
  }
}
export default function TimelineHistorial({ historial = [] }) {
  if (!historial.length) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>Sin historial disponible.</p>
      </div>
    )
  }
  return (
    <div className="relative py-10">
      <div className="absolute left-1/2 top-0 bottom-0 w-1.5 bg-slate-700/50 -translate-x-1/2 rounded-full" />
      <div className="space-y-16">
        {historial.map((h, index) => {
          const isEven = index % 2 === 0
          const Icon = ICONS_MAP[h.estado_nombre] || Clock
          const colorClass = COLOR_MAP[h.estado_nombre] || "text-slate-400 border-slate-400"
          const timeFormat = formatFecha(h.fecha_cambio)
          const label = h.estado_nombre?.replace(/_/g, " ") || h.estado_nombre
          return (
            <div key={h.id || index} className="relative w-full animate-fade-in-up">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className={`w-14 h-14 bg-slate-900 border-[3px] rounded-full flex items-center justify-center shadow-lg ${colorClass}`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
              </div>
              <div className={`flex w-full ${isEven ? "justify-start" : "justify-end"}`}>
                <div className={`w-1/2 relative ${isEven ? "pr-12 text-right" : "pl-12 text-left"}`}>
                  <div 
                    className={`absolute top-1/2 -translate-y-1/2 border-t-2 border-dotted border-slate-600/50 w-8
                      ${isEven ? "right-4" : "left-4"}`}
                  />
                  <div 
                    className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-slate-500 bg-slate-900
                      ${isEven ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"}`}
                  />
                  <div className={`inline-block ${isEven ? "pr-4" : "pl-4"}`}>
                    <h3 className="text-lg font-bold text-slate-200 uppercase tracking-wide">
                      {label}
                    </h3>
                    <p className={`text-sm font-semibold mt-1 ${colorClass.split(' ')[0]}`}>
                      {timeFormat.fecha}, horas {timeFormat.hora}
                    </p>
                    {h.sucursal_nombre && (
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">
                        {h.sucursal_nombre}
                      </p>
                    )}
                    {h.observacion && (
                      <p className="text-sm text-slate-500 italic mt-2">
                        "{h.observacion}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
