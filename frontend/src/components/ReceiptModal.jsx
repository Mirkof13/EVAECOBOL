import { QRCodeSVG } from "qrcode.react"
import { Printer } from "lucide-react"
export default function ReceiptModal({ envio, onClose }) {
  const rastreoUrl = `${window.location.origin}/rastreo?codigo=${envio.codigo_rastreo}`
  const fechaRegistro = new Date(envio.fecha_registro).toLocaleString("es-BO", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
  const origenNombre  = envio.sucursal_origen?.nombre  ?? "—"
  const destinoNombre = envio.sucursal_destino?.nombre ?? "—"
  const precio = parseFloat(envio.precio_bs).toFixed(2)
  const buildPrintHTML = () => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Recibo ECOBOL — ${envio.codigo_rastreo}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,Helvetica,sans-serif;padding:28px;color:#111;font-size:13px;max-width:580px;margin:0 auto}
    .header{text-align:center;border-bottom:3px solid #1d4ed8;padding-bottom:14px;margin-bottom:18px}
    .logo{font-size:28px;font-weight:900;color:#1d4ed8;letter-spacing:3px}
    .sub{font-size:11px;color:#555;margin-top:3px}
    .codigo{font-family:monospace;font-size:22px;font-weight:900;color:#1d4ed8;
      text-align:center;background:#eff6ff;border:2px dashed #93c5fd;
      border-radius:8px;padding:14px;margin:14px 0;letter-spacing:4px}
    .qr{text-align:center;margin:12px 0}
    .qr img{display:block;margin:0 auto;border:4px solid #eff6ff;border-radius:8px}
    .qr p{font-size:10px;color:#888;margin-top:5px}
    .section{margin:12px 0}
    .stitle{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;
      color:#1d4ed8;border-bottom:1px solid #dbeafe;padding-bottom:3px;margin-bottom:7px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .fl{font-size:10px;color:#777;margin-bottom:2px}
    .fv{font-size:13px;font-weight:600;color:#111}
    .precio{font-size:26px;font-weight:900;color:#059669;text-align:center;
      padding:12px;background:#ecfdf5;border-radius:8px;margin:14px 0}
    .footer{text-align:center;margin-top:20px;font-size:10px;color:#aaa;
      border-top:1px solid #e5e7eb;padding-top:12px}
    @media print{body{padding:0}}
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">ECOBOL</div>
    <div class="sub">Agencia Boliviana de Correos — Comprobante de Envío</div>
  </div>
  <div class="codigo">${envio.codigo_rastreo}</div>
  <div class="qr">
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(rastreoUrl)}" width="130" height="130" alt="QR Rastreo">
    <p>Escanea para rastrear tu envío en tiempo real</p>
    <p style="font-size:9px;color:#ccc;margin-top:2px">${rastreoUrl}</p>
  </div>
  <div class="section">
    <div class="stitle">Remitente</div>
    <div class="fl">Nombre</div><div class="fv">${envio.remitente_nombre}</div>
    <div class="fl" style="margin-top:4px">Teléfono</div><div class="fv">${envio.remitente_telefono}</div>
    ${envio.remitente_ci ? `<div class="fl" style="margin-top:4px">CI</div><div class="fv">${envio.remitente_ci}</div>` : ""}
  </div>
  <div class="section">
    <div class="stitle">Destinatario</div>
    <div class="fl">Nombre</div><div class="fv">${envio.destinatario_nombre}</div>
    <div class="fl" style="margin-top:4px">Teléfono</div><div class="fv">${envio.destinatario_telefono}</div>
    <div class="fl" style="margin-top:4px">Dirección</div><div class="fv">${envio.destinatario_direccion}</div>
  </div>
  <div class="grid">
    <div class="section"><div class="stitle">Sucursal Origen</div><div class="fv">${origenNombre}</div></div>
    <div class="section"><div class="stitle">Sucursal Destino</div><div class="fv">${destinoNombre}</div></div>
  </div>
  <div class="grid" style="margin-top:10px">
    <div class="section"><div class="stitle">Peso</div><div class="fv">${envio.peso_kg} kg</div></div>
    <div class="section"><div class="stitle">Descripción</div><div class="fv">${envio.descripcion}</div></div>
  </div>
  <div class="precio">Bs. ${precio}</div>
  <div class="section">
    <div class="stitle">Fecha de Registro</div>
    <div class="fv">${fechaRegistro}</div>
  </div>
  <div class="footer">
    <p>Conserve este comprobante como constancia de depósito postal.</p>
    <p>Reclamos y consultas: correos.bo | Línea gratuita: 800-10-7387</p>
    <p style="margin-top:6px">Impreso el ${new Date().toLocaleString("es-BO")}</p>
  </div>
</body>
</html>`
  const handlePrint = () => {
    const html = buildPrintHTML()
    const blob = new Blob([html], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const win = window.open(url, "_blank", "width=680,height=900")
    if (win) {
      win.addEventListener("load", () => {
        setTimeout(() => {
          win.print()
          URL.revokeObjectURL(url)
        }, 400)
      })
    } else {
      URL.revokeObjectURL(url)
    }
  }
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-bounce-in">
        <div className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Recibo de Envío</h2>
            <p className="text-blue-200 text-xs">Vista previa — ECOBOL</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6 bg-white text-gray-900 max-h-[60vh] overflow-y-auto">
          <div className="text-center mb-5">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Código de Rastreo</p>
            <p className="font-mono text-2xl font-black text-blue-700 tracking-widest">
              {envio.codigo_rastreo}
            </p>
          </div>
          <div className="flex flex-col items-center mb-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <QRCodeSVG
              value={rastreoUrl}
              size={128}
              fgColor="#1d4ed8"
              bgColor="transparent"
              level="M"
            />
            <p className="text-xs text-gray-400 mt-2 text-center">
              Escanea para rastrear en tiempo real
            </p>
          </div>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Remitente</p>
                <p className="font-semibold text-gray-800">{envio.remitente_nombre}</p>
                <p className="text-gray-500 text-xs">{envio.remitente_telefono}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Destinatario</p>
                <p className="font-semibold text-gray-800">{envio.destinatario_nombre}</p>
                <p className="text-gray-500 text-xs">{envio.destinatario_telefono}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Dirección de entrega</p>
              <p className="text-gray-700">{envio.destinatario_direccion}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3 text-center">
              <div>
                <p className="text-xs text-gray-400">Peso</p>
                <p className="font-bold text-gray-800">{envio.peso_kg} kg</p>
              </div>
              <div className="border-x border-gray-200">
                <p className="text-xs text-gray-400">Origen</p>
                <p className="font-semibold text-gray-800 text-xs leading-tight">{origenNombre}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Destino</p>
                <p className="font-semibold text-gray-800 text-xs leading-tight">{destinoNombre}</p>
              </div>
            </div>
            <div className="text-center py-2">
              <p className="text-xs text-gray-400">Precio Total</p>
              <p className="text-3xl font-black text-emerald-600">Bs. {precio}</p>
            </div>
            <p className="text-center text-xs text-gray-400 border-t border-gray-100 pt-3">
              {fechaRegistro}
            </p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Printer size={18} /> Imprimir Recibo
          </button>
        </div>
      </div>
    </div>
  )
}
