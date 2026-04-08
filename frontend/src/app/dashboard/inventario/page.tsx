"use client"

import { useEffect, useState } from "react"
import { getInsumos } from "@/services/api"
import { Package, Plus } from "lucide-react"

import { getSessionUser } from "@/lib/auth"

export default function InventarioPage() {
  const [insumos, setInsumos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sedeActiva, setSedeActiva] = useState("cdmx")

  useEffect(() => {
    const user = getSessionUser()
    const sedeUser = user?.sede || "cdmx"
    setSedeActiva(sedeUser)
    
    getInsumos(sedeUser)
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
            <h1 className="text-3xl font-bold tracking-tight">Inventario Global ({sedeActiva.toUpperCase()})</h1>
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

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Nombre', 'Categoría', 'Sede', 'Stock', 'Mínimo (Crítico)', 'Costo Base'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">Cargando inventario...</td></tr>
              ) : insumos.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">Inventario vacío.</td></tr>
              ) : (
                insumos.map((ins, i) => {
                  const maxCap = ins.capacidad_maxima || 100;
                  const pct = Math.min(100, Math.max(0, (ins.stock_actual / maxCap) * 100));
                  const isCritico = ins.stock_actual <= ins.nivel_critico;
                  
                  return (
                    <tr key={ins.id || i} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {ins.nombre}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-widest">
                          {ins.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-slate-500 uppercase bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                          {ins.sede?.toUpperCase() || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 min-w-[6rem]">
                          <div>
                            <span className="font-black text-slate-800 text-sm">{ins.stock_actual}</span>
                            <span className="text-slate-400 font-medium text-xs ml-1">/ {maxCap}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0 shadow-inner">
                            <div className={`h-full rounded-full transition-all duration-500 ${isCritico ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 bg-red-50 text-red-600 font-bold rounded-lg text-xs border border-red-100 shadow-sm">
                          {ins.nivel_critico}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 text-sm shadow-sm">
                          ${ins.costo_unitario?.toLocaleString('es-MX') || 0}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
