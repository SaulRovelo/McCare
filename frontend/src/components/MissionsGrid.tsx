"use client"

import { useEffect, useState } from "react"
import { MissionCard, type Mission } from "@/components/MissionCard"
import { DonationModal } from "@/components/DonationModal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getInsumos } from "@/services/api"

// Descripciones de respaldo para que la UI se vea genial aunque la BD solo tenga nombres cortos
const fallbackDescriptions: Record<string, string> = {
  "Alimentos": "Comidas calientes y saludables para familias que necesitan estar cerca de sus hijos hospitalizados.",
  "Higiene": "Productos esenciales de higiene para familias que salieron de casa inesperadamente.",
  "Médico": "Medicamentos básicos y suministros de primeros auxilios para familias con necesidades inmediatas.",
  "Cuidado": "Materiales de apoyo y cuidado para ayudar a los hermanos durante las visitas."
}

const sedesMock = [
  { id: "cdmx",   name: "Casa CDMX" },
  { id: "puebla", name: "Casa Puebla" },
  { id: "edomex", name: "Casa Estado de México" },
]

export function MissionsGrid() {
  const [misionesReales, setMisionesReales] = useState<Mission[]>([])
  const [misionSeleccionada, setMisionSeleccionada] = useState<Mission | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    getInsumos()
      .then((insumosA: any[]) => {
        // Mapear insumos reales a la estrucutra requerida por la UI MissionCard
        const mapeados: Mission[] = insumosA.map((ins) => {
          
          // Icono dinámico según categoría
          let iconType: "heart" | "zap" | "package" = "package"
          const catLower = ins.categoria.toLowerCase()
          if (catLower.includes("salud") || catLower.includes("médico")) iconType = "heart"
          if (catLower.includes("alimento")) iconType = "zap"

          // Urgencia dinámica real
          // CRÍTICO → stock_actual <= nivel_critico
          // EN RIESGO → stock_actual <= nivel_critico * 1.5
          // SALUDABLE → arriba de eso
          let urgencyType: "high" | "medium" | "low" = "low"
          if (ins.stock_actual <= ins.nivel_critico) {
            urgencyType = "high"
          } else if (ins.stock_actual <= ins.nivel_critico * 1.5) {
            urgencyType = "medium"
          }

          // Monto sugerido orientado al donante individual
          // → No es el costo total de re-stock, sino una contribución realista.
          // Equivlanecia: qué puede aportar 1 donante para cubrir ~3-7 días de consumo.
          const consumoDiario = ins.consumo_diario > 0 ? ins.consumo_diario : 1;
          const costoUnitario = ins.costo_unitario > 0 ? ins.costo_unitario : 10;
          // Cuántas unidades puede comprar con topes escalonados según urgencia
          let diasACubrir = urgencyType === 'high' ? 3 : urgencyType === 'medium' ? 5 : 7;
          let unidadesAportar = Math.round(consumoDiario * diasACubrir);
          let montoBruto = Math.round(unidadesAportar * costoUnitario);
          // Topes razonables para donante individual: mín $50, máx $500 MXN
          const montoFaltante = Math.max(50, Math.min(500, montoBruto));

          return {
            id: ins.id,
            title: ins.nombre,
            description: fallbackDescriptions[ins.categoria] || "Insumo elemental para sostener el bienestar de nuestras familias en casa.",
            icon: iconType,
            urgency: urgencyType,
            currentInventory: ins.stock_actual,
            targetInventory: ins.capacidad_maxima, // Barra visual usa 100% de la capacidad
            donationAmount: `$${montoFaltante}`,
            diasCubiertos: diasACubrir,
            category: ins.categoria,
            location: ins.sede
          }
        })

        // Ordenar globalmente por urgencia
        mapeados.sort((a,b) => {
          const ord = { high: 0, medium: 1, low: 2 }
          return ord[a.urgency] - ord[b.urgency]
        })
        
        setMisionesReales(mapeados)
      })
      .catch(console.error)
  }, [])

  const handleDonar = (mision: Mission) => {
    setMisionSeleccionada(mision)
    setModalAbierto(true)
  }

  // Fallback si no han cargado aún: se usa un array falso pero con LA MISMA estructura UI.
  // Para este ejemplo de tu instrucción, solo iteramos sobre misionesReales,
  // con la UI intacta.
  const displayMisiones = misionesReales

  return (
    <section id="misiones" className="bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header de sección */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Misiones Críticas
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Donde más se necesita tu ayuda
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Cada donación apoya directamente a familias durante sus momentos más difíciles.
            Elige una misión para hacer un impacto inmediato.
          </p>
        </div>

        {/* Tabs por sede */}
        <Tabs defaultValue="cdmx" className="mt-12">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-lg grid-cols-2 sm:grid-cols-3">
              {sedesMock.map((sede) => (
                <TabsTrigger key={sede.id} value={sede.id}>
                  {sede.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {sedesMock.map((sede) => (
            <TabsContent key={sede.id} value={sede.id} className="mt-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                
                {displayMisiones
                  .filter(m => m.location === sede.id)
                  .map(mision => (
                    <MissionCard
                      key={mision.id}
                      title={mision.title}
                      description={mision.description}
                      icon={mision.icon}
                      urgency={mision.urgency}
                      currentInventory={mision.currentInventory}
                      targetInventory={mision.targetInventory}
                      donationAmount={mision.donationAmount}
                      diasCubiertos={(mision as any).diasCubiertos}
                      category={mision.category}
                      onDonate={() => handleDonar(mision)}
                    />
                  ))}

                  {/* Si el tab está vacío temporalmente, no rompemos el CSS */}
                  {displayMisiones.filter(m => m.location === sede.id).length === 0 && (
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3 py-12 text-center text-sm text-muted-foreground">
                       Recabando datos de inventario para {sede.name}...
                    </div>
                  )}

              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* CTA general */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            ¿No puedes decidir? Haz una donación general y la asignaremos donde más se necesite.
          </p>
          <a href="/donar" className="mt-2 inline-block font-medium text-primary underline-offset-4 hover:underline">
            Hacer una Donación General →
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
