"use client"

import { useEffect, useState } from "react"
import { getForecast } from "@/services/api"
import ForecastBarChart from "@/components/ForecastBarChart"
import ForecastTable from "@/components/ForecastTable"
import { TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function ForecastPage() {
  const [forecasts, setForecasts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getForecast(50)
      .then((data) => {
        setForecasts(data)
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  const alertas = forecasts.filter(f => f.estado_forecast === "critico" || f.estado_forecast === "atencion")
  const total = forecasts.length

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FFBC0D]/20 rounded-lg">
            <TrendingUp className="h-6 w-6 text-[#FFBC0D]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">CareForecast (IA)</h1>
          <span className="px-3 py-1 bg-black text-white text-xs font-bold rounded-full ml-2">RIVER ML</span>
        </div>
        <p className="text-muted-foreground w-full max-w-3xl">
          Motor analítico basado en <b>Online Machine Learning</b> (Árboles de Hoeffding). 
          Evalúa cada salida de inventario en vivo para detectar agotamientos antes de que ocurran,
          adaptándose a los patrones de la Casa de forma continua.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-2">
          <span className="text-sm font-bold text-slate-400 uppercase">Insumos Monitoreados</span>
          <span className="text-4xl font-black text-slate-800">{loading ? "-" : total}</span>
        </div>
        <div className={`border rounded-2xl p-6 shadow-sm flex flex-col gap-2 ${alertas.length > 0 ? "bg-rose-50 border-rose-200" : "bg-white"}`}>
          <div className="flex justify-between items-center">
            <span className={`text-sm font-bold uppercase ${alertas.length > 0 ? "text-rose-500" : "text-slate-400"}`}>Alertas Críticas Activas</span>
            {alertas.length > 0 && <AlertTriangle className="h-5 w-5 text-rose-500" />}
          </div>
          <span className={`text-4xl font-black ${alertas.length > 0 ? "text-rose-600" : "text-slate-800"}`}>
            {loading ? "-" : alertas.length}
          </span>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm flex flex-col gap-2">
           <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-emerald-600 uppercase">Estado General del Modelo</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <span className="text-xl font-bold text-emerald-700 leading-tight mt-1">
            {loading ? "Calculando..." : alertas.length > 5 ? "Riesgo de Abasto" : "Operativo y Sano"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ForecastBarChart forecasts={forecasts} />
        </div>
        <div className="lg:col-span-2">
          <ForecastTable forecasts={forecasts} />
        </div>
      </div>
    </div>
  )
}
