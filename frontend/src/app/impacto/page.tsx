import Link from "next/link"
import {
  Heart,
  Home,
  UtensilsCrossed,
  Map,
  Hospital,
  Car,
  Users,
  Smile,
  Globe2,
  Sparkles,
  ArrowRight
} from "lucide-react"

import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function PaginaImpacto() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navigation />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="relative overflow-hidden bg-slate-900 px-4 py-16 sm:py-24 text-center border-b border-border/50">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="mx-auto max-w-4xl relative z-10">
            <Badge className="mb-4 bg-white/20 text-white border-none hover:bg-white/30 backdrop-blur-sm">
              Datos al Cierre de Diciembre 2025
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-md">
              Nuestro Impacto en Cifras
            </h1>
            <p className="mt-6 text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Gracias a nuestra red de donantes y el modelo predictivo McCare, 
              hemos logrado transformar la incertidumbre en esperanza medible y real.
            </p>
          </div>
        </section>

        {/* Bento Grid Impacto */}
        <section className="px-4 py-16 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Dato Principal (Span 2 columnas) */}
            <Card className="lg:col-span-2 border-none shadow-md overflow-hidden relative group bg-gradient-to-br from-white to-slate-50">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Smile className="w-48 h-48 text-[#DA291C]" />
              </div>
              <CardContent className="p-8 sm:p-10 relative z-10 flex flex-col justify-center h-full">
                <div className="w-16 h-16 bg-red-100/50 flex items-center justify-center rounded-2xl mb-6">
                  <Heart className="w-8 h-8 text-[#DA291C] fill-[#DA291C]" />
                </div>
                <h3 className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tighter mb-2">
                  11,365
                </h3>
                <p className="text-xl sm:text-2xl font-bold text-slate-600">
                  Niños y jóvenes apoyados en total
                </p>
              </CardContent>
            </Card>

            {/* Ocupación de Casas (Lateral) */}
            <Card className="border-border/50 shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="w-5 h-5 text-slate-500" />
                  Ocupación Actual de Casas
                </CardTitle>
                <p className="text-sm text-muted-foreground">Monitoreo en tiempo real</p>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-700">Casa CDMX</span>
                    <span className="text-rose-600">95%</span>
                  </div>
                  <Progress value={95} className="h-2 bg-slate-100" indicatorClassName="bg-rose-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-700">Casa Puebla</span>
                    <span className="text-amber-500">80%</span>
                  </div>
                  <Progress value={80} className="h-2 bg-slate-100" indicatorClassName="bg-amber-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-700">Casa EdoMex</span>
                    <span className="text-emerald-500">50%</span>
                  </div>
                  <Progress value={50} className="h-2 bg-slate-100" indicatorClassName="bg-emerald-500" />
                </div>
              </CardContent>
            </Card>

            {/* Desglose de Niños */}
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-6 flex flex-col items-start">
                <Home className="w-8 h-8 text-blue-500 mb-4" />
                <h3 className="text-4xl font-extrabold text-slate-900 mb-1">3,829</h3>
                <p className="text-sm font-medium text-slate-500">Apoyados en Casas RM</p>
              </CardContent>
            </Card>
            
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-6 flex flex-col items-start">
                <Users className="w-8 h-8 text-indigo-500 mb-4" />
                <h3 className="text-4xl font-extrabold text-slate-900 mb-1">2,103</h3>
                <p className="text-sm font-medium text-slate-500">Apoyados en Salas Familiares</p>
              </CardContent>
            </Card>
            
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-6 flex flex-col items-start">
                <Sparkles className="w-8 h-8 text-fuchsia-500 mb-4" />
                <h3 className="text-4xl font-extrabold text-slate-900 mb-1">5,433</h3>
                <p className="text-sm font-medium text-slate-500">Apoyados en otros programas</p>
              </CardContent>
            </Card>

            {/* Operatividad */}
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-6 flex flex-col items-start">
                <UtensilsCrossed className="w-8 h-8 text-orange-500 mb-4" />
                <h3 className="text-4xl font-extrabold text-slate-900 mb-1">173,717</h3>
                <p className="text-sm font-medium text-slate-500">Raciones de comida servidas</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-6 flex flex-col items-start">
                <Car className="w-8 h-8 text-cyan-500 mb-4" />
                <h3 className="text-4xl font-extrabold text-slate-900 mb-1">2,284</h3>
                <p className="text-sm font-medium text-slate-500">Viajes en rutas a Hospitales</p>
              </CardContent>
            </Card>
            
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-6 flex flex-col items-start">
                <Heart className="w-8 h-8 text-rose-500 mb-4" />
                <h3 className="text-4xl font-extrabold text-slate-900 mb-1">224</h3>
                <p className="text-sm font-medium text-slate-500">Donantes recurrentes activos</p>
              </CardContent>
            </Card>

            {/* Geografía (Span largo) */}
            <Card className="lg:col-span-3 border-border/50 shadow-sm bg-slate-900 text-white overflow-hidden relative">
               <div className="absolute -right-10 -bottom-20 opacity-20 pointer-events-none">
                 <Globe2 className="w-64 h-64" />
               </div>
               <CardContent className="p-8 sm:p-10 relative z-10 flex flex-col sm:flex-row items-center gap-10">
                 <div className="flex-1 flex flex-col sm:flex-row gap-8">
                   <div>
                     <div className="flex items-center gap-2 mb-2 text-blue-400">
                       <Hospital className="w-5 h-5" />
                       <span className="font-semibold uppercase text-sm tracking-wider">Hospitales</span>
                     </div>
                     <h3 className="text-5xl font-black mb-1">29</h3>
                     <p className="text-slate-400 text-sm">Instituciones de procedencia</p>
                   </div>
                   
                   <div className="hidden sm:block w-px bg-slate-700 mx-4" />
                   
                   <div>
                     <div className="flex items-center gap-2 mb-2 text-emerald-400">
                       <Map className="w-5 h-5" />
                       <span className="font-semibold uppercase text-sm tracking-wider">Cobertura Geográfica</span>
                     </div>
                     <h3 className="text-5xl font-black mb-1">30 <span className="text-2xl font-bold text-slate-500">Estados</span> / 52 <span className="text-2xl font-bold text-slate-500">Países</span></h3>
                     <p className="text-slate-400 text-sm">Familias recibidas de toda la República e Internacionales</p>
                   </div>
                 </div>
               </CardContent>
            </Card>
            
          </div>
        </section>

        {/* Call To Action */}
        <section className="bg-slate-100 px-4 py-20 text-center border-t border-slate-200">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4 text-balance">
              Detrás de cada número, hay una familia real.
            </h2>
            <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto">
              Únete a nuestra plataforma para convertirte en el motor operativo que hace posible estas historias. Sé parte de la familia McCare.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-[#DA291C] hover:bg-[#b8221a] text-white px-8 h-14 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Link href="/register">
                Únete como Donante <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
