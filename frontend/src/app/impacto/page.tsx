"use client"

import {
  Heart,
  Star,
  Home,
  BedDouble,
  Activity,
  Utensils,
  Users,
  Car,
  Building2,
  Globe2,
  HeartHandshake
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"

export default function ImpactoPage() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-slate-50 pb-20 pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* ── HEADER DE IMPACTO ── */}
          <div className="mb-16 text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#DA291C]/20 bg-[#DA291C]/10 px-4 py-1.5 text-sm font-medium text-[#DA291C]">
              <Heart className="h-4 w-4 fill-current" />
              <span>Transparencia y Resultados</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Reporte de Impacto Acumulado
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
              Cifras oficiales al cierre de <strong className="text-slate-700">Diciembre 2025</strong>.
              Gracias a nuestra red de apoyo, seguimos manteniendo a las familias cerca cuando más lo necesitan.
            </p>
          </div>

          {/* ── HERO METRIC (El dato más importante) ── */}
          <div className="mb-12 flex justify-center">
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-12 text-center shadow-2xl sm:px-16 sm:py-16 w-full max-w-4xl">
              <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#DA291C]/20 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-[#FFBC0D]/20 blur-3xl" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                  <Star className="h-10 w-10 text-[#FFBC0D] fill-[#FFBC0D]" />
                </div>
                <span className="text-6xl font-black tracking-tight text-white sm:text-8xl">
                  11,365
                </span>
                <h2 className="mt-4 text-xl font-medium uppercase tracking-widest text-slate-300 sm:text-2xl">
                  Niños Apoyados en Total
                </h2>
              </div>
            </div>
          </div>

          {/* ── GRID DE DISTRIBUCIÓN DE NIÑOS Y RED DE APOYO ── */}
          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Niños en Casas */}
            <Card className="border-0 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-[#DA291C]/50">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className="mb-4 rounded-full bg-red-50 p-4 text-[#DA291C]">
                  <Home className="h-8 w-8" />
                </div>
                <span className="text-3xl font-bold text-slate-900">3,829</span>
                <p className="mt-2 text-sm text-slate-500">Niños apoyados en <br />Casas Ronald McDonald</p>
              </CardContent>
            </Card>

            {/* Niños en Salas */}
            <Card className="border-0 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-amber-500/50">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className="mb-4 rounded-full bg-amber-50 p-4 text-amber-600">
                  <BedDouble className="h-8 w-8" />
                </div>
                <span className="text-3xl font-bold text-slate-900">2,103</span>
                <p className="mt-2 text-sm text-slate-500">Niños apoyados en <br />Salas Familiares</p>
              </CardContent>
            </Card>

            {/* Otros Programas */}
            <Card className="border-0 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-blue-500/50">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className="mb-4 rounded-full bg-blue-50 p-4 text-blue-600">
                  <Activity className="h-8 w-8" />
                </div>
                <span className="text-3xl font-bold text-slate-900">5,433</span>
                <p className="mt-2 text-sm text-slate-500">Niños apoyados en <br />Otros Programas</p>
              </CardContent>
            </Card>

            {/* Voluntarios */}
            <Card className="border-0 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-emerald-500/50">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className="mb-4 rounded-full bg-emerald-50 p-4 text-emerald-600">
                  <Users className="h-8 w-8" />
                </div>
                <span className="text-3xl font-bold text-slate-900">2,567</span>
                <p className="mt-2 text-sm text-slate-500">Voluntarios que <br />apoyaron los programas</p>
              </CardContent>
            </Card>
          </div>

          {/* ── SECCIÓN DOBLE: OCUPACIÓN Y LOGÍSTICA ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Ocupación de Casas (Barras de progreso) */}
            <Card className="border-0 shadow-sm ring-1 ring-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Home className="h-5 w-5 text-[#DA291C]" />
                  Nivel de Ocupación por Casa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* CDMX */}
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm font-medium">
                    <span className="text-slate-700">Casa CDMX</span>
                    <span className="text-[#DA291C]">95%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#DA291C]" style={{ width: "95%" }} />
                  </div>
                </div>

                {/* Puebla */}
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm font-medium">
                    <span className="text-slate-700">Casa Puebla</span>
                    <span className="text-amber-500">80%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: "80%" }} />
                  </div>
                </div>

                {/* EdoMex */}
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm font-medium">
                    <span className="text-slate-700">Casa Estado de México</span>
                    <span className="text-blue-500">50%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: "50%" }} />
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Logística y Operación (Grid interno 2x2) */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 bg-orange-50/50 shadow-sm ring-1 ring-orange-100">
                <CardContent className="flex flex-col justify-center p-6 text-center h-full">
                  <Utensils className="mx-auto mb-3 h-6 w-6 text-orange-600" />
                  <span className="text-2xl font-bold text-slate-900">173,717</span>
                  <p className="mt-1 text-xs text-slate-600">Raciones de<br />comida servida</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-100">
                <CardContent className="flex flex-col justify-center p-6 text-center h-full">
                  <Car className="mx-auto mb-3 h-6 w-6 text-indigo-600" />
                  <span className="text-2xl font-bold text-slate-900">2,284</span>
                  <p className="mt-1 text-xs text-slate-600">Viajes en rutas<br />a Hospitales</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-rose-50/50 shadow-sm ring-1 ring-rose-100">
                <CardContent className="flex flex-col justify-center p-6 text-center h-full">
                  <HeartHandshake className="mx-auto mb-3 h-6 w-6 text-rose-600" />
                  <span className="text-2xl font-bold text-slate-900">224</span>
                  <p className="mt-1 text-xs text-slate-600">Donantes<br />activos</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-teal-50/50 shadow-sm ring-1 ring-teal-100">
                <CardContent className="flex flex-col justify-center p-6 text-center h-full">
                  <Building2 className="mx-auto mb-3 h-6 w-6 text-teal-600" />
                  <span className="text-2xl font-bold text-slate-900">29</span>
                  <p className="mt-1 text-xs text-slate-600">Hospitales de donde<br />recibimos niños</p>
                </CardContent>
              </Card>
            </div>

          </div>

          {/* ── ALCANCE GEOGRÁFICO ── */}
          <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col items-center justify-between gap-6 p-8 md:flex-row md:p-10">
              <div className="flex items-center gap-6">
                <div className="rounded-full bg-slate-100 p-4 text-slate-600">
                  <Globe2 className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Alcance Nacional e Internacional</h3>
                  <p className="mt-1 text-slate-500">
                    Recibimos a familias que viajan buscando esperanza y tratamiento.
                  </p>
                </div>
              </div>
              <div className="flex gap-8 text-center md:text-right">
                <div>
                  <span className="block text-4xl font-black text-[#DA291C]">30</span>
                  <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Estados de la República</span>
                </div>
                <div className="hidden w-px bg-slate-200 sm:block"></div>
                <div>
                  <span className="block text-4xl font-black text-[#DA291C]">52</span>
                  <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Países</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}