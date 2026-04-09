"use client"

import { useEffect, useState } from "react"
import { Heart, ArrowRight, Shield, Users, Clock } from "lucide-react"
import Link from "next/link"
import { getImpactoResumen } from "@/services/api"

export function Hero() {
  const [resumen, setResumen] = useState<any>(null)

  useEffect(() => {
    // Mantenemos tu conexión al backend de Antigravity
    getImpactoResumen().then(setResumen).catch(console.error)
  }, [])

  return (
    <section className="relative bg-slate-900 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1759800382253-ed88020e57d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMHBsYXlpbmclMjBoYXBweSUyMHN1bmxpZ2h0JTIwd2FybXxlbnwxfHx8fDE3NzU1OTcxNzd8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Niños felices en la Casa Ronald McDonald"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/80 to-slate-900" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
        {/* Logo */}
        <div className="inline-flex items-center gap-2.5 mb-8">
          <Heart className="w-8 h-8 text-[#DA291C] fill-[#DA291C]" />
          <span className="text-white" style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
            McCare
          </span>
        </div>

        {/* Títulos */}
        <h1
          className="text-white max-w-4xl mx-auto"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.025em" }}
        >
          Cada donación protege a un niño.{" "}
          <span className="text-[#FFBC0D]">Cada segundo cuenta.</span>
        </h1>
        <p className="text-slate-300 mt-5 max-w-2xl mx-auto" style={{ fontSize: "1.125rem", lineHeight: 1.7 }}>
          McCare conecta en tiempo real las necesidades más urgentes de la Casa de la Amistad Ronald McDonald con personas dispuestas a ayudar.
        </p>

        {/* Botones (Llamados a la acción) */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Link
            href="/donar"
            className="bg-[#DA291C] hover:bg-[#b8221a] text-white px-8 py-3.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-red-600/30"
            style={{ fontSize: "1rem", fontWeight: 600 }}
          >
            <Heart className="w-5 h-5" />
            Donar Ahora
          </Link>
          <a
            href="#misiones"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer backdrop-blur-sm"
            style={{ fontSize: "1rem", fontWeight: 500 }}
          >
            Conoce las Misiones
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Trust indicators (Conectados a tu API) */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span style={{ fontSize: "0.8125rem" }}>Donataria autorizada</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-600 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span style={{ fontSize: "0.8125rem" }}>
              +{resumen ? resumen.familias_apoyadas || "2,400" : "2,400"} donadores activos
            </span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-600 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span style={{ fontSize: "0.8125rem" }}>Impacto en tiempo real</span>
          </div>
        </div>
      </div>
    </section>
  )
}