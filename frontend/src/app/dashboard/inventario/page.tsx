"use client"

import { useEffect, useState } from "react"
import { getInsumos } from "@/services/api"
import { Package, Plus } from "lucide-react"

export default function InventarioPage() {
  const [insumos, setInsumos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInsumos()
      .then((data) => {
        setInsumos(data)
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Package className="h-6 w-6 text-slate-700" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Inventario Global</h1>
          </div>
          <button className="bg-[#DB0007] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-[#b00005] transition-colors">
            <Plus className="h-4 w-4" />
            Nuevo Insumo
          </button>
        </div>
        <p className="text-muted-foreground w-full max-w-3xl">
          Administración y control directo de los productos almacenados en las Casas Ronald McDonald.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['ID', 'Nombre', 'Categoría', 'Sede', 'Stock', 'Mínimo (Crítico)', 'Costo Base'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">Cargando inventario...</td></tr>
              ) : insumos.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">Inventario vacío.</td></tr>
              ) : (
                insumos.map((ins, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{String(ins.id).substring(0,6)}...</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{ins.nombre}</td>
                    <td className="px-6 py-4 text-slate-500 uppercase text-xs font-bold">{ins.categoria}</td>
                    <td className="px-6 py-4 text-slate-500">{ins.sede?.toUpperCase() || '-'}</td>
                    <td className="px-6 py-4 font-black text-slate-800">{ins.stock_actual} / {ins.capacidad_maxima || 100}</td>
                    <td className="px-6 py-4 text-rose-500 font-bold">{ins.nivel_critico}</td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">${ins.costo_unitario}</td>
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
