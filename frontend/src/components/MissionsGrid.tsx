"use client"

import { useEffect, useState } from "react"
import { Heart, Clock, Target, Users, Zap, ArrowRight, Flame } from "lucide-react"
import { DonationModal } from "@/components/DonationModal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getInsumos } from "@/services/api"

// Descripciones emocionales de respaldo
const fallbackDescriptions: Record<string, string> = {
  "Alimentos": "Garantiza la alimentación saludable de familias que necesitan estar cerca de sus hijos hospitalizados. Cada comida significa un día más de nutrición y esperanza.",
  "Higiene": "Artículos esenciales de cuidado personal para familias que salieron de casa inesperadamente y necesitan mantenerse fuertes.",
  "Médico": "Suministros de primeros auxilios e insumos clínicos básicos para familias con necesidades de salud inmediatas.",
  "Cuidado": "Materiales de apoyo, confort y cuidado para abrigar a los niños y sus familias durante las noches más largas."
}

// Imágenes de respaldo según categoría
const categoryImages: Record<string, string> = {
  "Alimentos": "https://images.unsplash.com/photo-1639122654099-6e3017e70c21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "Higiene": "https://images.unsplash.com/photo-1584308666744-24d5e4a819b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "Médico": "https://images.unsplash.com/photo-1576089275776-b6cd5deabdad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "Cuidado": "https://images.unsplash.com/photo-1762922542177-689d5b007e61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "default": "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
}

const sedesMock = [
  { id: "cdmx", name: "Casa CDMX" },
  { id: "puebla", name: "Casa Puebla" },
  { id: "edomex", name: "Casa Estado de México" },
]

export function MissionsGrid() {
  const [misionesReales, setMisionesReales] = useState<any[]>([])
  const [misionSeleccionada, setMisionSeleccionada] = useState<any | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    getInsumos()
      .then((insumosA: any[]) => {
        // Mapear insumos reales a la nueva estructura visual de Figma
        const mapeados = insumosA.map((ins) => {

          // Lógica de Urgencia Real
          let urgencyType: "high" | "medium" | "low" = "low"
          if (ins.stock_actual <= ins.nivel_critico) urgencyType = "high"
          else if (ins.stock_actual <= ins.nivel_critico * 1.5) urgencyType = "medium"

          // Matemáticas para simular la meta de Crowdfunding
          const costoUnitario = ins.costo_unitario > 0 ? ins.costo_unitario : 85;
          const raisedBruto = Math.round(ins.stock_actual * costoUnitario);
          const goalBruto = Math.round(ins.capacidad_maxima * costoUnitario);
          // Asegurarnos de que goal siempre sea mayor que raised visualmente
          const goal = goalBruto > raisedBruto ? goalBruto : raisedBruto + 1000;
          const raised = raisedBruto;

          const percent = Math.min(100, Math.round((raised / goal) * 100));

          // Cálculo de tiempo restante basado en consumo
          const consumoDiario = ins.consumo_diario > 0 ? ins.consumo_diario : 1;
          const horasRestantes = Math.max(1, Math.round((ins.stock_actual / consumoDiario) * 24));

          return {
            id: ins.id,
            title: ins.nombre,
            emotion: fallbackDescriptions[ins.categoria] || "Tu ayuda transforma la incertidumbre en esperanza para nuestras familias.",
            image: categoryImages[ins.categoria] || categoryImages.default,
            raised: raised,
            goal: goal,
            percent: percent,
            timeLeft: horasRestantes > 48 ? `${Math.round(horasRestantes / 24)} días` : `${horasRestantes} horas`,
            donors: Math.floor(Math.random() * 40) + 12, // Simulador de donadores para el MVP
            beneficiaries: `${Math.floor(Math.random() * 6) + 2} familias`,
            location: ins.sede,
            urgency: urgencyType,
            // Guardamos datos originales por si el modal los necesita
            raw: ins
          }
        })

        // Ordenar globalmente por urgencia (Primero las más críticas)
        mapeados.sort((a, b) => {
          const ord = { high: 0, medium: 1, low: 2 }
          return ord[a.urgency as keyof typeof ord] - ord[b.urgency as keyof typeof ord]
        })

        setMisionesReales(mapeados)
      })
      .catch(console.error)
  }, [])

  const handleDonar = (mision: any) => {
    setMisionSeleccionada(mision)
    setModalAbierto(true)
  }

  return (
    <section id="misiones" className="bg-slate-50 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header de Sección ── */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-200 rounded-full mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-red-700" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
              {misionesReales.filter(m => m.urgency === 'high').length} misiones urgentes detectadas por IA
            </span>
          </div>

          <h2 className="text-slate-900" style={{ fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Misiones Críticas Activas
          </h2>
          <p className="text-slate-500 mt-4 mx-auto" style={{ fontSize: "1.125rem", lineHeight: 1.7, maxWidth: "38rem" }}>
            Estos niños y familias necesitan tu ayuda urgente. Nuestro sistema asigna los recursos en tiempo real. Elige una misión y cambia una vida hoy.
          </p>
        </div>

        {/* ── Tabs por Sede ── */}
        <Tabs defaultValue="cdmx" className="mt-8">
          <div className="flex justify-center mb-10">
            <TabsList className="grid w-full max-w-lg grid-cols-2 sm:grid-cols-3 bg-white border border-slate-200 shadow-sm p-1 rounded-xl">
              {sedesMock.map((sede) => (
                <TabsTrigger key={sede.id} value={sede.id} className="rounded-lg data-[state=active]:bg-[#DA291C] data-[state=active]:text-white">
                  {sede.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {sedesMock.map((sede) => (
            <TabsContent key={sede.id} value={sede.id}>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
                {misionesReales
                  .filter(m => m.location === sede.id)
                  .map((mission) => (
                    <div
                      key={mission.id}
                      className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-red-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                      {/* ── Image Section ── */}
                      <div className="relative h-56 sm:h-64 overflow-hidden bg-slate-100">
                        <img
                          src={mission.image}
                          alt={mission.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                        {/* Floating urgency badge */}
                        {mission.urgency === 'high' && (
                          <div className="absolute top-4 left-4">
                            <div className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-full shadow-lg shadow-red-600/30">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                              </span>
                              <span style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.05em" }}>
                                URGENCIA CRÍTICA
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Beneficiaries badge */}
                        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-slate-800 px-3 py-1.5 rounded-full shadow-sm">
                          <Heart className="w-3.5 h-3.5 text-[#DA291C] fill-[#DA291C]" />
                          <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{mission.beneficiaries}</span>
                        </div>

                        {/* Time badge */}
                        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-sm text-white px-3 py-1.5 rounded-full shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{mission.timeLeft}</span>
                        </div>
                      </div>

                      {/* ── Content Section ── */}
                      <div className="flex-1 p-6 flex flex-col">
                        <h3 className="text-slate-900" style={{ fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.3 }}>
                          {mission.title}
                        </h3>
                        <p className="text-slate-500 mt-2 flex-1" style={{ fontSize: "0.9375rem", lineHeight: 1.65 }}>
                          {mission.emotion}
                        </p>

                        {/* ── Progress Bar ── */}
                        <div className="mt-5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-900" style={{ fontSize: "0.9375rem", fontWeight: 700 }}>
                              ${mission.raised.toLocaleString()} <span className="text-slate-400" style={{ fontWeight: 400, fontSize: "0.8125rem" }}>MXN</span>
                            </span>
                            <span className="text-slate-400" style={{ fontSize: "0.8125rem" }}>
                              de ${mission.goal.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-red-500 to-red-600"
                              style={{ width: `${mission.percent}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-red-600" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                              {mission.percent}% financiado
                            </span>
                            <div className="flex items-center gap-1 text-slate-400">
                              <Users className="w-3.5 h-3.5" />
                              <span style={{ fontSize: "0.75rem" }}>{mission.donors} donadores</span>
                            </div>
                          </div>
                        </div>

                        {/* ── Urgency Metrics Row ── */}
                        <div className="flex items-center gap-3 mt-5 p-3 bg-red-50/60 border border-red-100 rounded-xl">
                          <div className="flex-1 text-center">
                            <div className="flex items-center justify-center gap-1 text-red-600 mb-0.5">
                              <Target className="w-3.5 h-3.5" />
                              <span style={{ fontSize: "0.6875rem", fontWeight: 500 }}>Meta</span>
                            </div>
                            <span className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 700 }}>
                              ${mission.goal.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-px h-8 bg-red-200" />
                          <div className="flex-1 text-center">
                            <div className="flex items-center justify-center gap-1 text-red-600 mb-0.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span style={{ fontSize: "0.6875rem", fontWeight: 500 }}>Restante</span>
                            </div>
                            <span className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 700 }}>
                              {mission.timeLeft}
                            </span>
                          </div>
                          <div className="w-px h-8 bg-red-200" />
                          <div className="flex-1 text-center">
                            <div className="flex items-center justify-center gap-1 text-red-600 mb-0.5">
                              <Zap className="w-3.5 h-3.5" />
                              <span style={{ fontSize: "0.6875rem", fontWeight: 500 }}>Falta</span>
                            </div>
                            <span className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 700 }}>
                              ${(mission.goal - mission.raised).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* ── CTA Button ── */}
                        <button
                          onClick={() => handleDonar(mission)}
                          className="w-full mt-5 bg-[#DA291C] hover:bg-[#b8221a] text-white py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-red-600/20 hover:shadow-red-600/30"
                          style={{ fontSize: "0.9375rem", fontWeight: 600 }}
                        >
                          <Heart className="w-4 h-4" />
                          Aportar a esta misión
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                {/* Mensaje de carga si no hay misiones en esa sede aún */}
                {misionesReales.filter(m => m.location === sede.id).length === 0 && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
                    Analizando el inventario de la {sede.name} en tiempo real...
                  </div>
                )}
              </div>

            </TabsContent>
          ))}
        </Tabs>

        {/* ── Bottom CTA ── */}
        <div className="text-center mt-16 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto">
          <p className="text-slate-600 mb-4" style={{ fontSize: "1rem" }}>
            ¿Tienes una empresa o quieres cubrir una misión completa? Las organizaciones pueden patrocinar necesidades enteras y obtener beneficios ESG.
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors cursor-pointer shadow-md shadow-slate-900/20"
            style={{ fontSize: "0.9375rem", fontWeight: 500 }}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            Quiero ser Socio Corporativo
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>

      <DonationModal
        open={modalAbierto}
        onOpenChange={setModalAbierto}
        mission={misionSeleccionada}
      />
    </section>
  )
}