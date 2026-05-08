import { useState, useEffect, useCallback } from "react"
const SLIDES = [
  {
    dept: "La Paz",
    icon: "🏔️",
    sub: "Sede de Gobierno",
    fact: "La sucursal más alta del mundo, a 3.640 m.s.n.m.",
    from: "from-blue-950",
    via: "via-blue-900",
    to: "to-indigo-950",
    accent: "text-blue-300",
    dot: "bg-blue-400",
  },
  {
    dept: "Santa Cruz",
    icon: "🌿",
    sub: "Capital Económica",
    fact: "Nodo principal de distribución del sistema ECOBOL.",
    from: "from-emerald-950",
    via: "via-green-900",
    to: "to-teal-950",
    accent: "text-emerald-300",
    dot: "bg-emerald-400",
  },
  {
    dept: "Cochabamba",
    icon: "🌸",
    sub: "Ciudad Jardín",
    fact: "Centro logístico del correo nacional boliviano.",
    from: "from-rose-950",
    via: "via-pink-900",
    to: "to-fuchsia-950",
    accent: "text-rose-300",
    dot: "bg-rose-400",
  },
  {
    dept: "Oruro",
    icon: "🎭",
    sub: "Capital del Folklore",
    fact: "Ruta crítica de tránsito entre norte y sur del país.",
    from: "from-amber-950",
    via: "via-orange-900",
    to: "to-yellow-950",
    accent: "text-amber-300",
    dot: "bg-amber-400",
  },
  {
    dept: "Potosí",
    icon: "⛰️",
    sub: "Villa Imperial",
    fact: "Punto de distribución para las comunidades mineras.",
    from: "from-zinc-900",
    via: "via-stone-800",
    to: "to-slate-900",
    accent: "text-zinc-300",
    dot: "bg-zinc-400",
  },
  {
    dept: "Sucre",
    icon: "⚖️",
    sub: "Capital Constitucional",
    fact: "Archivo histórico de correspondencia judicial del país.",
    from: "from-violet-950",
    via: "via-purple-900",
    to: "to-indigo-950",
    accent: "text-violet-300",
    dot: "bg-violet-400",
  },
  {
    dept: "Tarija",
    icon: "🍇",
    sub: "Ciudad de los Sauces",
    fact: "Principal exportador de envíos de productos regionales.",
    from: "from-red-950",
    via: "via-rose-900",
    to: "to-pink-950",
    accent: "text-red-300",
    dot: "bg-red-400",
  },
  {
    dept: "Trinidad",
    icon: "🦜",
    sub: "Capital del Beni",
    fact: "Servicio aéreo prioritario por acceso fluvial limitado.",
    from: "from-cyan-950",
    via: "via-sky-900",
    to: "to-blue-950",
    accent: "text-cyan-300",
    dot: "bg-cyan-400",
  },
  {
    dept: "Cobija",
    icon: "🌳",
    sub: "Capital de Pando",
    fact: "Frontera amazónica — envíos con tarifa especial +20%.",
    from: "from-lime-950",
    via: "via-green-900",
    to: "to-emerald-950",
    accent: "text-lime-300",
    dot: "bg-lime-400",
  },
]
export default function ImageCarousel() {
  const [current, setCurrent] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const goTo = useCallback((index) => {
    if (transitioning) return
    setTransitioning(true)
    setTimeout(() => {
      setCurrent(index)
      setTransitioning(false)
    }, 300)
  }, [transitioning])
  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length)
  }, [current, goTo])
  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length)
  }, [current, goTo])
  useEffect(() => {
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [next])
  const slide = SLIDES[current]
  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${slide.from} ${slide.via} ${slide.to} transition-all duration-700`}
      />
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-8 right-8 w-64 h-64 border border-white rounded-full" />
        <div className="absolute top-16 right-16 w-48 h-48 border border-white rounded-full" />
        <div className="absolute bottom-8 left-8 w-48 h-48 border border-white rounded-full" />
        <div className="absolute bottom-16 left-16 w-32 h-32 border border-white rounded-full" />
      </div>
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5 blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-white/5 blur-3xl animate-pulse-slow"
        style={{ animationDelay: "2s" }} />
      <div
        className={`relative z-10 h-full flex flex-col items-center justify-center px-8 transition-opacity duration-300 ${
          transitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2">
            <div className="w-6 h-6 bg-white/90 rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-black text-xs">E</span>
            </div>
            <span className="text-white/90 font-semibold text-sm tracking-wide">ECOBOL</span>
          </div>
        </div>
        <div className="text-7xl mb-4 drop-shadow-2xl animate-float">
          {slide.icon}
        </div>
        <h2 className="text-4xl font-black text-white text-center drop-shadow-lg leading-tight">
          {slide.dept}
        </h2>
        <p className={`text-sm font-semibold mt-1 ${slide.accent}`}>
          {slide.sub}
        </p>
        <div className="w-12 h-0.5 bg-white/30 my-5 rounded-full" />
        <p className="text-white/60 text-sm text-center max-w-xs leading-relaxed">
          {slide.fact}
        </p>
        <div className="mt-6 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
          <span className="text-white/50 text-xs">Sucursal</span>
          <span className="text-white font-bold text-sm">
            {current + 1} / {SLIDES.length}
          </span>
          <span className="text-white/50 text-xs">de Bolivia</span>
        </div>
      </div>
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-all duration-200 backdrop-blur-sm border border-white/10"
        aria-label="Anterior"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-all duration-200 backdrop-blur-sm border border-white/10"
        aria-label="Siguiente"
      >
        ›
      </button>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {SLIDES.map((s, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? `w-5 h-2 ${slide.dot}`
                : "w-2 h-2 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Ir a ${s.dept}`}
          />
        ))}
      </div>
    </div>
  )
}
