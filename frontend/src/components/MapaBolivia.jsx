
import mapaBoliviaImg from "../assets/mapa_bolivia.png"

const INITIAL_DEPARTAMENTOS = [
  { id: "Cobija",     label: "Pando",      x: "28.26%", y: "12.45%", color: "#22c55e" },
  { id: "Trinidad",   label: "Beni",       x: "42.32%", y: "30.08%", color: "#06b6d4" },
  { id: "La Paz",     label: "La Paz",     x: "22.90%", y: "42.58%", color: "#3b82f6" },
  { id: "Cochabamba", label: "Cochabamba", x: "41.87%", y: "51.51%", color: "#ec4899" },
  { id: "Santa Cruz", label: "Santa Cruz", x: "68.00%", y: "52.00%", color: "#10b981" },
  { id: "Oruro",      label: "Oruro",      x: "23.57%", y: "62.45%", color: "#f59e0b" },
  { id: "Potosi",     label: "Potosí",     x: "29.60%", y: "73.61%", color: "#8b5cf6" },
  { id: "Sucre",      label: "Chuquisaca", x: "46.79%", y: "70.93%", color: "#6366f1" },
  { id: "Tarija",     label: "Tarija",     x: "50.13%", y: "84.32%", color: "#ef4444" },
]

function heatColor(total, max) {
  if (!total || !max) return "bg-slate-800 border-slate-700"
  const pct = total / max
  if (pct > 0.7) return "bg-red-900/60 border-red-500/60"
  if (pct > 0.4) return "bg-amber-900/60 border-amber-500/60"
  if (pct > 0.1) return "bg-blue-900/60 border-blue-500/60"
  return "bg-slate-800/80 border-slate-600"
}

export default function MapaBolivia({ datos = [] }) {
  const maxTotal = Math.max(...datos.map(d => d.total || 0), 1)
  
  const getTotal = (deptId) => {
    const match = datos.find(d =>
      (d["sucursal_origen__nombre"] || d.nombre || "")
        .toLowerCase().includes(deptId.toLowerCase())
    )
    return match?.total ?? 0
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Mapa de Bolivia — Carga por Departamento
        </h2>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-slate-800 border border-slate-600" /> Sin datos
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-900 border border-blue-500" /> Bajo
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-900 border border-amber-500" /> Medio
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-900 border border-red-500" /> Alto
          </span>
        </div>
      </div>
      
      <div 
        className="relative w-full max-w-md mx-auto aspect-square bg-slate-800/20 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-800/50"
      >
        <img 
          src={mapaBoliviaImg} 
          alt="Mapa de Bolivia" 
          className="w-full h-full object-contain opacity-80 drop-shadow-2xl pointer-events-none" 
        />
        
        {INITIAL_DEPARTAMENTOS.map((dept) => {
          const total = getTotal(dept.id);
          return (
            <div
              key={dept.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-default"
              style={{ left: dept.x, top: dept.y }}
              title="Arrastra para reubicar"
            >
              <div 
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-full border-2 shadow-xl shadow-black/50 backdrop-blur-md transition-all duration-300 group-hover:scale-110 ${heatColor(total, maxTotal)}`}
                style={{ zIndex: 10 + total }}
              >
                <span className="text-sm font-black text-white pointer-events-none">{total}</span>
              </div>
              <span className="mt-1 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700 text-[10px] font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity absolute top-full whitespace-nowrap z-20 pointer-events-none">
                {dept.label}
              </span>
            </div>
          )
        })}
      </div>

      {datos.length === 0 && (
        <p className="text-center text-slate-600 text-xs mt-4">
          Sin datos de envíos por departamento.
        </p>
      )}
    </div>
  )
}
