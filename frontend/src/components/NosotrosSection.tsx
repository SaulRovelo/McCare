"use client"

import { BrainCircuit, ShieldCheck, Users } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function NosotrosSection() {
  return (
    <section id="nosotros" className="py-20 bg-slate-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-red-100/40 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-amber-100/40 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-balance">
              ¿Qué es McCare?
            </h2>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              <strong>McCare</strong> es una solución novedosa que integra herramientas avanzadas de Machine Learning y <strong>CareForecast IA</strong> en una plataforma de captación de recursos, diseñada específicamente para optimizar el apoyo y la operatividad de las Casas Ronald McDonald.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pilar 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full border-slate-200 hover:border-red-200 transition-colors bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md">
              <CardHeader className="pb-3 text-center items-center">
                <div className="w-14 h-14 bg-red-50 text-[#DA291C] rounded-2xl flex items-center justify-center mb-2">
                  <BrainCircuit className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl">Tecnología Predictiva</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-slate-600">
                <p>Predicción de necesidades hospitalarias y estrés de inventario mediante algoritmos de Inteligencia Artificial.</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pilar 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full border-slate-200 hover:border-blue-200 transition-colors bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md">
              <CardHeader className="pb-3 text-center items-center">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-2">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl">Transparencia Total</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-slate-600">
                <p>Trazabilidad absoluta de cada donación, desde el aporte hasta la familia que recibe el impacto real.</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pilar 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="h-full border-slate-200 hover:border-amber-200 transition-colors bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md">
              <CardHeader className="pb-3 text-center items-center">
                <div className="w-14 h-14 bg-amber-50 text-[#F59E0B] rounded-2xl flex items-center justify-center mb-2">
                  <Users className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl">Comunidad</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-slate-600">
                <p>Conectando eficientemente a aliados corporativos y donantes individuales con las familias más vulnerables.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
