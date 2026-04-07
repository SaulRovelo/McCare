"use client"

import { useEffect, useState } from "react"
import { getMovimientosGlobales } from "@/services/api"
import { Heart, Download } from "lucide-react"

export default function DonacionesPage() {
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Para donaciones obtenemos movimientos y filtramos 'entrada'
    getMovimientosGlobales(100)
      .then((data) => {
        setMovimientos(data.filter((m: any) => m.tipo_movimiento === "entrada"))
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Heart className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Registro de Donaciones</h1>
          </div>
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>
        <p className="text-muted-foreground w-full max-w-3xl">
          Historial transparente de entradas de inventario a través de donantes públicos, corporativos o inyecciones internas.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Fecha', 'Insumo ID', 'Cantidad Aportada', 'Stock Resultante', 'Origen / Observación'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Cargando bitácora...</td></tr>
              ) : movimientos.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">No hay aportaciones registradas recientes.</td></tr>
              ) : (
                movimientos.map((mov, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 font-medium">
                        {new Date(mov.fecha).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{String(mov.insumo_id).substring(0,8)}...</td>
                    <td className="px-6 py-4 font-black text-emerald-600">+{mov.cantidad}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{mov.stock_resultante}</td>
                    <td className="px-6 py-4 text-slate-600 text-xs">{mov.observacion || 'Aportación generalizada anonimizada'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
