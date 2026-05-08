import { createContext, useContext, useState, useCallback } from "react"
const ToastContext = createContext(null)
const ICONS = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  warning: "⚠",
}
const STYLES = {
  success: "bg-emerald-900/95 border-emerald-700/60 text-emerald-200",
  error:   "bg-red-900/95 border-red-700/60 text-red-200",
  info:    "bg-blue-900/95 border-blue-700/60 text-blue-200",
  warning: "bg-amber-900/95 border-amber-700/60 text-amber-200",
}
const ICON_STYLES = {
  success: "bg-emerald-500/20 text-emerald-400",
  error:   "bg-red-500/20 text-red-400",
  info:    "bg-blue-500/20 text-blue-400",
  warning: "bg-amber-500/20 text-amber-400",
}
function ToastItem({ toast, onRemove }) {
  return (
    <div
      className={`flex items-start gap-3 w-full max-w-sm px-4 py-3 rounded-2xl border backdrop-blur-sm shadow-2xl animate-slide-up ${STYLES[toast.type]}`}
    >
      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${ICON_STYLES[toast.type]}`}>
        {ICONS[toast.type]}
      </span>
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity text-sm mt-0.5"
      >
        ✕
      </button>
    </div>
  )
}
function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4500)
  }, [])
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])
  const toast = {
    success: (msg) => addToast(msg, "success"),
    error:   (msg) => addToast(msg, "error"),
    info:    (msg) => addToast(msg, "info"),
    warning: (msg) => addToast(msg, "warning"),
  }
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}
export const useToast = () => useContext(ToastContext)
