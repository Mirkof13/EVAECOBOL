
const BADGE_MAP = {
  REGISTRADO: "badge-registrado",
  EN_TRANSITO: "badge-transito",
  EN_SUCURSAL_DESTINO: "badge-sucursal",
  EN_RUTA_ENTREGA: "badge-ruta",
  ENTREGADO: "badge-entregado",
  DEVUELTO: "badge-devuelto",
}
function formatFecha(isoStr) {
  if (!isoStr) return "—"
  return new Date(isoStr).toLocaleString("es-BO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}
export default function TablaEnvios({ envios = [], onRowClick, loading }) {
  if (loading) {
    return (
      <div className="table-container">
        <div className="flex items-center justify-center py-16">
          <div className="flex gap-2">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }
  if (!envios.length) {
    return (
      <div className="table-container">
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <div className="text-slate-600 text-4xl">📦</div>
          <p className="text-zinc-500 text-sm">No se encontraron envios con los filtros seleccionados.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="table-container">
      <table className="w-full">
        <thead>
          <tr>
            <th className="table-header text-left">Codigo</th>
            <th className="table-header text-left">Remitente</th>
            <th className="table-header text-left">Destinatario</th>
            <th className="table-header text-left">Origen</th>
            <th className="table-header text-left">Destino</th>
            <th className="table-header text-left">Estado</th>
            <th className="table-header text-right">Precio</th>
            <th className="table-header text-left">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {envios.map((e) => (
            <tr
              key={e.id}
              className="table-row"
              onClick={() => onRowClick && onRowClick(e)}
            >
              <td className="table-cell">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-orange-400 text-xs font-semibold">
                    {e.codigo_rastreo}
                  </span>
                  {e.esta_retrasado && (
                    <span className="badge bg-red-900/60 text-red-300 border border-red-700/50 text-xs">
                      RETRASADO
                    </span>
                  )}
                </div>
              </td>
              <td className="table-cell">{e.remitente_nombre}</td>
              <td className="table-cell">{e.destinatario_nombre}</td>
              <td className="table-cell text-zinc-400">{e.sucursal_origen_nombre}</td>
              <td className="table-cell text-zinc-400">{e.sucursal_destino_nombre}</td>
              <td className="table-cell">
                <span className={`badge ${BADGE_MAP[e.estado_actual_nombre] || "badge-registrado"}`}>
                  {e.estado_actual_nombre?.replace(/_/g, " ")}
                </span>
              </td>
              <td className="table-cell text-right font-semibold text-emerald-400">
                Bs. {parseFloat(e.precio_bs).toFixed(2)}
              </td>
              <td className="table-cell text-xs text-zinc-500">
                {formatFecha(e.fecha_registro)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
