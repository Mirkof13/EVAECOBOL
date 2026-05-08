import { useState, useEffect } from "react"
import lapaz      from "../assets/departamentos/lapaz.jpg"
import santacruz  from "../assets/departamentos/santacruz.png"
import cochabamba from "../assets/departamentos/cochabamba.png"
import oruro      from "../assets/departamentos/oruro.png"
import potosi     from "../assets/departamentos/potosi.png"
import tarija     from "../assets/departamentos/tarija.png"
import beni       from "../assets/departamentos/beni.png"
import pando      from "../assets/departamentos/pando.png"
import chuquisaca from "../assets/departamentos/chuquisaca.png"

const SLIDES = [
  { img: lapaz,      nombre: "La Paz",      desc: "Sede de Gobierno — Capital Administrativa" },
  { img: santacruz,  nombre: "Santa Cruz",  desc: "Capital Económica de Bolivia" },
  { img: cochabamba, nombre: "Cochabamba",  desc: "La Ciudad Jardín del Continente" },
  { img: oruro,      nombre: "Oruro",       desc: "Capital del Folklore Boliviano" },
  { img: potosi,     nombre: "Potosí",      desc: "Ciudad Imperial — Patrimonio de la Humanidad" },
  { img: tarija,     nombre: "Tarija",      desc: "Ciudad de los Marqueses" },
  { img: beni,       nombre: "Beni",        desc: "Corazón de la Amazonía Boliviana" },
  { img: pando,      nombre: "Pando",       desc: "Puerta a la Selva Amazónica" },
  { img: chuquisaca, nombre: "Chuquisaca",  desc: "La Ciudad Blanca — Capital Constitucional" },
]

export default function ImageCarousel() {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState(null)

  useEffect(() => {
    const t = setInterval(() => {
      setPrev(current)
      setCurrent(p => (p + 1) % SLIDES.length)
    }, 4800)
    return () => clearInterval(t)
  }, [current])

  const goTo = (i) => {
    if (i === current) return
    setPrev(current)
    setCurrent(i)
  }

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-black">
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            opacity: i === current ? 1 : 0,
            transition: "opacity 1.2s cubic-bezier(0.4,0,0.2,1)",
            zIndex: i === current ? 1 : 0,
          }}
        >
          <img
            src={slide.img}
            alt={slide.nombre}
            className="w-full h-full object-cover"
            style={{ transform: i === current ? "scale(1.03)" : "scale(1)", transition: "transform 5s ease-out" }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />


          <div
            className="absolute bottom-14 left-8 right-8"
            style={{
              opacity: i === current ? 1 : 0,
              transform: i === current ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s",
            }}
          >
            <p className="text-orange-400 text-xs font-bold uppercase tracking-[0.25em] mb-2">
              Bolivia · ECOBOL
            </p>
            <h2 className="text-5xl font-black text-white leading-tight drop-shadow-lg">
              {slide.nombre}
            </h2>
            <p className="text-zinc-300 text-sm mt-2 font-medium">{slide.desc}</p>
          </div>
        </div>
      ))}


      <div className="absolute bottom-5 right-8 flex gap-1.5 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="rounded-full transition-all duration-400"
            style={{
              width: i === current ? "24px" : "6px",
              height: "6px",
              background: i === current ? "#f97316" : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>


      <div className="absolute top-8 right-8 z-10 text-xs text-zinc-500 font-mono tabular-nums">
        {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
      </div>
    </div>
  )
}
