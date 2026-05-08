import { useState, useEffect } from "react"
import api from "../services/api"
import { useToast } from "../context/ToastContext"
import { QRCodeSVG } from "qrcode.react"
import { CheckCircle, Printer, Camera } from "lucide-react"
export default function ModalNuevoEnvio({ onClose, onSuccess }) {
  const [sucursales, setSucursales] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [foto, setFoto] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [envioCreado, setEnvioCreado] = useState(null)
  const toast = useToast()
  const [form, setForm] = useState({
    remitente_nombre: "",
    remitente_telefono: "",
    remitente_ci: "",
    destinatario_nombre: "",
    destinatario_telefono: "",
    destinatario_direccion: "",
    descripcion: "",
    peso_kg: "",
    sucursal_origen_id: "",
    sucursal_destino_id: "",
    fecha_estimada: "",
  })
  useEffect(() => {
    api.get("/sucursales/").then(({ data }) => setSucursales(data))
  }, [])
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }
  const handleFoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFoto(file)
    setFotoPreview(URL.createObjectURL(file))
  }
  const quitarFoto = () => {
    setFoto(null)
    setFotoPreview(null)
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const payload = new FormData()
      Object.entries(form).forEach(([key, val]) => {
        if (val !== "" && val !== null) payload.append(key, val)
      })
      if (foto) payload.append("foto_envio", foto)
      const res = await api.post("/envios/", payload)
      toast.success("Envío registrado correctamente.")
      setEnvioCreado(res.data)
      onSuccess()
    } catch (err) {
      const msg = err.response?.data
      if (typeof msg === "object") {
        const first = Object.values(msg)[0]
        const texto = Array.isArray(first) ? first[0] : JSON.stringify(msg)
        setError(texto)
        toast.error(texto)
      } else {
        setError("Error al registrar el envío.")
        toast.error("Error al registrar el envío.")
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto card animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Registrar Nuevo Envío</h2>
            <p className="text-sm text-slate-500 mt-0.5">El código ECO-YYYY-XXXXX se genera automáticamente</p>
          </div>
          <button onClick={onClose} className="btn-ghost w-8 h-8 p-0 text-lg">✕</button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-700/50 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}
        {envioCreado ? (
          <div className="text-center py-6 animate-slide-up">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-100 mb-2">¡Envío Registrado!</h3>
            <p className="text-slate-400 text-sm mb-8">
              El paquete ha sido ingresado al sistema. Entregue este código al cliente.
            </p>
            <div className="bg-white p-6 rounded-2xl max-w-sm mx-auto mb-8 shadow-xl relative overflow-hidden print-area">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 to-blue-800" />
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1 mt-2">Código de Rastreo</p>
              <p className="text-3xl font-black text-slate-900 font-mono tracking-wider mb-6">
                {envioCreado.codigo_rastreo}
              </p>
              <div className="flex justify-center mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <QRCodeSVG 
                  value={`http://localhost:5173/rastreo?codigo=${envioCreado.codigo_rastreo}`} 
                  size={140}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="text-left text-xs space-y-2 border-t border-slate-100 pt-4 text-slate-600">
                <div className="flex justify-between">
                  <span className="font-semibold">Remitente:</span>
                  <span>{envioCreado.remitente_nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Destinatario:</span>
                  <span>{envioCreado.destinatario_nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Peso:</span>
                  <span>{envioCreado.peso_kg} kg</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-sm mt-2">
                  <span>Total Pagado:</span>
                  <span>Bs. {parseFloat(envioCreado.precio_bs).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2">
                <Printer size={18} /> Imprimir Comprobante
              </button>
              <button onClick={onClose} className="btn-primary">
                Cerrar y Continuar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <fieldset>
              <legend className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
                Remitente
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nombre completo *</label>
                  <input name="remitente_nombre" value={form.remitente_nombre}
                    onChange={handleChange} required className="input" placeholder="Ej: Juan Quispe" />
                </div>
                <div>
                  <label className="label">Teléfono *</label>
                  <input name="remitente_telefono" value={form.remitente_telefono}
                    onChange={handleChange} required className="input" placeholder="70012345" />
                </div>
                <div className="col-span-2">
                  <label className="label">CI (opcional)</label>
                  <input name="remitente_ci" value={form.remitente_ci}
                    onChange={handleChange} className="input" placeholder="1234567 LP" />
                </div>
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                Destinatario
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nombre completo *</label>
                  <input name="destinatario_nombre" value={form.destinatario_nombre}
                    onChange={handleChange} required className="input" placeholder="Ej: Ana Mamani" />
                </div>
                <div>
                  <label className="label">Teléfono *</label>
                  <input name="destinatario_telefono" value={form.destinatario_telefono}
                    onChange={handleChange} required className="input" placeholder="71234567" />
                </div>
                <div className="col-span-2">
                  <label className="label">Dirección de entrega *</label>
                  <input name="destinatario_direccion" value={form.destinatario_direccion}
                    onChange={handleChange} required className="input"
                    placeholder="Av. San Martín 123, Barrio Las Américas" />
                </div>
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-3">
                Datos del Envío
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Sucursal Origen *</label>
                  <select name="sucursal_origen_id" value={form.sucursal_origen_id}
                    onChange={handleChange} required className="select">
                    <option value="">Seleccionar...</option>
                    {sucursales.map((s) => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Sucursal Destino *</label>
                  <select name="sucursal_destino_id" value={form.sucursal_destino_id}
                    onChange={handleChange} required className="select">
                    <option value="">Seleccionar...</option>
                    {sucursales.map((s) => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Peso (kg) * — máx. 20 kg</label>
                  <input type="number" name="peso_kg" value={form.peso_kg}
                    onChange={handleChange} required min="0.1" max="20" step="0.1"
                    className="input" placeholder="0.1 - 20" />
                </div>
                <div>
                  <label className="label">Fecha estimada de entrega</label>
                  <input type="date" name="fecha_estimada" value={form.fecha_estimada}
                    onChange={handleChange} className="input" />
                </div>
                <div className="col-span-2">
                  <label className="label">Descripción del contenido *</label>
                  <textarea name="descripcion" value={form.descripcion}
                    onChange={handleChange} required rows={2}
                    className="input resize-none"
                    placeholder="Ej: Documentos notariales, ropa, electrodoméstico..." />
                </div>
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">
                Foto del Envío (opcional)
              </legend>
              <div className="border-2 border-dashed border-slate-700 rounded-xl overflow-hidden transition-colors hover:border-slate-600">
                {fotoPreview ? (
                  <div className="relative">
                    <img src={fotoPreview} alt="Vista previa"
                      className="w-full max-h-40 object-cover" />
                    <button
                      type="button"
                      onClick={quitarFoto}
                      className="absolute top-2 right-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-900/80 transition"
                    >
                      Quitar foto
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 p-6 cursor-pointer text-slate-400 hover:text-white transition-colors">
                    <Camera size={40} className="mb-2" />
                    <span className="text-sm font-medium">
                      Clic para seleccionar imagen
                    </span>
                    <span className="text-xs text-slate-600">JPG, PNG, WEBP — máx. 5 MB</span>
                    <input type="file" accept="image/*" onChange={handleFoto} className="hidden" />
                  </label>
                )}
              </div>
            </fieldset>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? "Registrando..." : "Registrar Envío"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
