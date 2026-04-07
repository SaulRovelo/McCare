"use client"

import { useEffect, useState } from "react"
import { Heart, Users, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getImpactoResumen } from "@/services/api"

export function Hero() {
  const [resumen, setResumen] = useState<any>(null)

  useEffect(() => {
    getImpactoResumen().then(setResumen).catch(console.error)
  }, [])

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Decoración de fondo */}
      <div className="absolute right-0 top-0 -z-10 size-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#DB0007]/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 size-72 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#FFBC0D]/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Heart className="size-4" />
            <span>Apoyando familias desde 1974</span>
          </div>

          {/* Título */}
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            McCare | Al Cuidado de los Niños
          </h1>

          {/* Subtítulo */}
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Manteniendo a las familias cerca cuando más se necesita. 
            {resumen && resumen.familias_en_riesgo > 0 && (
              <span className="block mt-2 font-semibold text-[#DB0007]">Ayúdanos a proteger a {resumen.familias_en_riesgo} familias en riesgo hoy.</span>
            )}
          </p>
        </div>

        {/* Estadísticas */}
        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-none bg-card shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col items-center gap-2 p-6">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="size-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-foreground">
                {resumen ? resumen.familias_actuales : "45"}
              </span>
              <span className="text-center text-sm text-muted-foreground">
                Familias actualmente alojadas
              </span>
            </CardContent>
          </Card>

          <Card className="border-none bg-card shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col items-center gap-2 p-6">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#FFBC0D]/20">
                <Heart className="size-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-foreground">
                {resumen ? "1,205" : "1,205"}
              </span>
              <span className="text-center text-sm text-muted-foreground">
                Familias apoyadas
              </span>
            </CardContent>
          </Card>

          <Card className="border-none bg-card shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col items-center gap-2 p-6">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="size-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-foreground">
                {resumen ? resumen.total_historias : "89"}
              </span>
              <span className="text-center text-sm text-muted-foreground">
                Misiones identificadas
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
