"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { 
  BrainCircuit, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  TrendingDown,
  DatabaseZap,
  Activity
} from "lucide-react"

import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function PaginaNosotros() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navigation />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="relative overflow-hidden bg-slate-900 px-4 py-20 sm:py-32 text-center border-b border-border/50">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="mx-auto max-w-4xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-6 bg-white/20 text-white border-none backdrop-blur-sm px-4 py-1.5 text-sm uppercase tracking-widest font-semibold">
                Sobre Nosotros
              </Badge>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl drop-shadow-md pb-6 text-balance">
                El futuro de la Filantropía es <span className="text-[#FFBC0D]">Predictivo</span>
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light">
                McCare es una solución innovadora que fusiona Machine Learning con compasión humana para asegurar que a las Casas Ronald McDonald nunca les falte lo esencial.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pilares Originales Conservados */}
        <section className="py-20 bg-slate-50 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-balance">
                Nuestros 3 Pilares
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="h-full border-slate-200 hover:border-red-200 transition-colors shadow-sm hover:shadow-md bg-white">
                <CardHeader className="pb-3 text-center items-center">
                  <div className="w-16 h-16 bg-red-50 text-[#DA291C] rounded-2xl flex items-center justify-center mb-4">
                    <BrainCircuit className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-2xl">Tecnología Predictiva</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-slate-600 text-lg">
                  <p>Modelamos los niveles de estrés de inventario mediante algoritmos de IA para accionar alertas antes del desabasto.</p>
                </CardContent>
              </Card>

              <Card className="h-full border-slate-200 hover:border-blue-200 transition-colors shadow-sm hover:shadow-md bg-white">
                <CardHeader className="pb-3 text-center items-center">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-2xl">Transparencia Total</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-slate-600 text-lg">
                  <p>Trazabilidad absoluta de cada donación. Sabes exactamente qué insumo pagaste y cuándo llegó a la Casa.</p>
                </CardContent>
              </Card>

              <Card className="h-full border-slate-200 hover:border-amber-200 transition-colors shadow-sm hover:shadow-md bg-white">
                <CardHeader className="pb-3 text-center items-center">
                  <div className="w-16 h-16 bg-amber-50 text-[#F59E0B] rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-2xl">Comunidad</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-slate-600 text-lg">
                  <p>Conectando eficientemente a aliados corporativos y donantes individuales con las familias que más lo necesitan.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Sección Ampliada: El Modelo de Predicción */}
        <section className="py-24 bg-white border-y border-slate-200 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div>
                  <Badge variant="outline" className="mb-4 text-emerald-600 border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold uppercase">
                    CareForecast IA
                  </Badge>
                  <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mb-6">
                    Predecir la necesidad salva vidas.
                  </h2>
                  <p className="text-lg text-slate-600 leading-relaxed mb-6">
                    Históricamente, la donación asistencial se ha basado en un modelo reactivo: se donan recursos cuando los anaqueles ya están vacíos. 
                    En McCare, integramzamos modelos de <strong>Series de Tiempo y Redes Neuronales</strong> para evaluar la velocidad de agotamiento de insumos básicos (alimentos infantiles, medicinas, material de curación).
                  </p>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Nuestra IA analiza variables históricas, tasas de ingreso en las Casas Ronald McDonald y densidad de consumo para definir un <strong>Punto Crítico Inminente</strong>. Esto permite levantar <em>"Misiones Activas"</em> días antes de que exista un desabasto real.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <Activity className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-slate-900">Alerta Temprana</h4>
                      <p className="text-sm text-slate-600 mt-1">Detectamos tendencias a la baja 7 a 14 días antes del colapso.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <TrendingDown className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-slate-900">Eficiencia de Recurso</h4>
                      <p className="text-sm text-slate-600 mt-1">Minimizamos gastos logísticos solicitando aportes de urgencia exacta.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 sm:col-span-2">
                    <DatabaseZap className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-slate-900">Ecosistema Dinámico</h4>
                      <p className="text-sm text-slate-600 mt-1">Las variables de consumo se retroalimentan mes as mes, logrando predicciones cada vez más afiladas al entorno hospitalario mexicano.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Graphic / Visual representation */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative lg:h-[600px] bg-slate-900 rounded-3xl p-8 overflow-hidden shadow-2xl flex flex-col justify-center"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
                
                <div className="relative z-10 border border-slate-800 bg-slate-900/80 backdrop-blur-xl rounded-xl p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-white font-semibold">Simulador de Inventario</div>
                    <Badge className="bg-rose-500 hover:bg-rose-600 text-white">Alarma Predicha</Badge>
                  </div>

                  <div className="space-y-4 mb-4">
                     <div className="h-6 w-full bg-slate-800 rounded-lg overflow-hidden relative border border-slate-700">
                        <div className="absolute left-0 top-0 h-full bg-emerald-500 w-[80%]" />
                     </div>
                     <div className="text-slate-400 text-xs text-right">Días Previos: Abasto Securo</div>
                     
                     <div className="h-6 w-full bg-slate-800 rounded-lg overflow-hidden relative border border-slate-700">
                        <div className="absolute left-0 top-0 h-full bg-amber-500 w-[45%]" />
                        <div className="absolute block h-full w-[2px] bg-red-400 left-[45%]" />
                     </div>
                     <div className="text-slate-400 text-xs text-right">T=0 Punto de Intervención IA</div>
                     
                     <div className="h-6 w-full bg-slate-800 rounded-lg overflow-hidden relative border border-slate-700 opacity-50">
                        <div className="absolute left-0 top-0 h-full bg-red-500 w-[15%]" />
                     </div>
                     <div className="text-rose-400 text-xs text-right">Desabasto Previsto Editado</div>
                  </div>
                  
                  <div className="bg-slate-800 p-4 rounded-lg mt-6 text-sm text-slate-300 italic border-l-4 border-blue-500">
                    "Al intervenir en T=0, McCare logra captar fondos y activar compras de mayoreo, reabasteciendo la Casa Ronald McDonald antes de que las familias noten el déficit."
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Call To Action */}
        <section className="bg-slate-50 px-4 py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4 text-balance">
              Detrás de cada predicción estadística, existe una familia amparada.
            </h2>
            <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto">
              Tú eres el último eslabón de esta cadena tecnológica. Sumérgete en nuestra red y aporta al inventario que está por vaciarse hoy mismo.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-[#DA291C] hover:bg-[#b8221a] text-white px-8 h-14 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Link href="/register">
                Crear mi cuenta de Donante <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
