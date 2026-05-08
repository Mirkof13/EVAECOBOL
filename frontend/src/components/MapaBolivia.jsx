
const DEPARTAMENTOS = [
  { id: "Cobija",     label: "Pando",      x: 1, y: 0, icon: "🌳", color: "#22c55e" },
  { id: "Trinidad",   label: "Beni",       x: 2, y: 0, icon: "🦜", color: "#06b6d4" },
  { id: "La Paz",     label: "La Paz",     x: 0, y: 1, icon: "🏔️",  color: "#3b82f6" },
  { id: "Cochabamba", label: "Cochabamba", x: 1, y: 1, icon: "🌸", color: "#ec4899" },
  { id: "Santa Cruz", label: "Santa Cruz", x: 2, y: 1, icon: "🌿", color: "#10b981" },
  { id: "Oruro",      label: "Oruro",      x: 0, y: 2, icon: "🎭", color: "#f59e0b" },
  { id: "Potosi",     label: "Potosí",     x: 0, y: 3, icon: "⛰️",  color: "#8b5cf6" },
  { id: "Sucre",      label: "Chuquisaca", x: 1, y: 3, icon: "⚖️",  color: "#6366f1" },
  { id: "Tarija",     label: "Tarija",     x: 1, y: 4, icon: "🍇", color: "#ef4444" },
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
  const grid = Array.from({ length: 5 }, () => Array(3).fill(null))
  DEPARTAMENTOS.forEach(d => { grid[d.y][d.x] = d })
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Mapa de Bolivia — Carga por Departamento
        </h2>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-slate-700 border border-slate-600" /> Sin datos
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-800 border border-blue-500" /> Bajo
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-800 border border-amber-500" /> Medio
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-800 border border-red-500" /> Alto
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 max-w-sm mx-auto">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-3 gap-2">
            {row.map((dept, colIdx) =>
              dept ? (
                <div
                  key={dept.id}
                  className={`border rounded-xl p-3 text-center transition-all duration-300 hover:scale-105 cursor-default ${heatColor(getTotal(dept.id), maxTotal)}`}
                >
                  <div className="text-2xl mb-1 animate-float" style={{ animationDelay: `${(rowIdx * 3 + colIdx) * 0.2}s` }}>
                    {dept.icon}
                  </div>
                  <p className="text-xs font-semibold text-slate-200 leading-tight">{dept.label ?? dept.id}</p>
                  <p className="text-lg font-black text-white mt-0.5">
                    {getTotal(dept.id)}
                  </p>
                  <p className="text-xs text-slate-500">envíos</p>
                </div>
              ) : (
                <div key={colIdx} />
              )
            )}
          </div>
        ))}
      </div>
      {datos.length === 0 && (
        <p className="text-center text-slate-600 text-xs mt-4">
          Sin datos de envíos por departamento.
        </p>
      )}
    </div>
  )
}
