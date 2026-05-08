import mapaBoliviaImg from "../assets/mapa_bolivia.png"

const DEPARTAMENTOS = [
  { id: "Pando",      sucId: "Cobija",     left: "19%", top: "8%"  },
  { id: "Beni",       sucId: "Trinidad",   left: "55%", top: "22%" },
  { id: "La Paz",     sucId: "La Paz",     left: "16%", top: "40%" },
  { id: "Cochabamba", sucId: "Cochabamba", left: "36%", top: "54%" },
  { id: "Santa Cruz", sucId: "Santa Cruz", left: "66%", top: "50%" },
  { id: "Oruro",      sucId: "Oruro",      left: "19%", top: "58%" },
  { id: "Potosí",     sucId: "Potosi",     left: "26%", top: "70%" },
  { id: "Chuquisaca", sucId: "Sucre",      left: "42%", top: "73%" },
  { id: "Tarija",     sucId: "Tarija",     left: "37%", top: "86%" },
]

function heatColor(total, max) {
  if (!total || !max) return { bg: "bg-zinc-900/70", text: "text-zinc-400", border: "border-zinc-700/50" }
  const pct = total / max
  if (pct > 0.6) return { bg: "bg-orange-500/30", text: "text-orange-300", border: "border-orange-500/60" }
  if (pct > 0.3) return { bg: "bg-amber-500/20",  text: "text-amber-300",  border: "border-amber-500/50" }
  return { bg: "bg-zinc-800/70", text: "text-zinc-300", border: "border-zinc-600/50" }
}

export default function MapaBolivia({ datos = [] }) {
  const maxTotal = Math.max(...datos.map(d => d.total || 0), 1)

  const getTotal = (sucId) => {
    const match = datos.find(d =>
      (d["sucursal_origen__nombre"] || "").toLowerCase().includes(sucId.toLowerCase())
    )
    return match?.total ?? 0
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Mapa de Bolivia — Envíos por Departamento
        </h2>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-800 border border-zinc-600" /> Sin envíos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/30 border border-amber-500" /> Medio
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-orange-500/40 border border-orange-500" /> Alto
          </span>
        </div>
      </div>

      <div className="relative w-full max-w-sm mx-auto select-none" style={{ aspectRatio: "1 / 1.1" }}>
        <img
          src={mapaBoliviaImg}
          alt="Mapa de Bolivia"
          className="w-full h-full object-contain opacity-80"
          draggable={false}
        />

        {DEPARTAMENTOS.map((dept) => {
          const total = getTotal(dept.sucId)
          const { bg, text, border } = heatColor(total, maxTotal)
          return (
            <div
              key={dept.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: dept.left, top: dept.top }}
            >
              <div className={`${bg} ${border} border rounded-lg px-2 py-1 text-center backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-110 cursor-default`}>
                <p className={`text-[9px] font-bold leading-tight ${text}`} style={{ whiteSpace: "nowrap" }}>
                  {dept.id}
                </p>
                <p className={`text-sm font-black leading-none mt-0.5 ${text}`}>
                  {total}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {datos.length === 0 && (
        <p className="text-center text-zinc-600 text-xs mt-3">Sin datos de envíos por departamento aún.</p>
      )}
    </div>
  )
}
