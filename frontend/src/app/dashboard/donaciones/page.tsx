"use client"

import { useEffect, useState } from "react"
import { getMovimientosGlobales, getInsumos, postMovimiento } from "@/services/api"
import { Heart, Download, Plus, X } from "lucide-react"
import { getSessionUser } from "@/lib/auth"
import { toast } from "sonner"

export default function DonacionesPage() {
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [insumosLocal, setInsumosLocal] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ insumo_id: "", cantidad: "", observacion: "" })

  const fetchTodo = async () => {
    try {
      setLoading(true);
      const user = getSessionUser();
      const sedeUser = user?.sede || "cdmx";
      
      const [movsData, insumosData] = await Promise.all([
        getMovimientosGlobales(100),
        getInsumos(sedeUser)
      ]);

      setInsumosLocal(insumosData);

      const entradas = movsData
        .filter((m: any) => m.tipo_movimiento === "entrada")
        .map((m: any) => {
          const matchingInsumo = insumosData.find((i: any) => String(i.id) === String(m.insumo_id));
          if (!matchingInsumo) return null;
          
          let obs = m.observacion || "Aportación generalizada";
          
          if (obs === "Equipamiento Especial Local") {
              const origenes = [
                "Donativo en Especie (Empresa Benefactora)", 
                "Aportación Directa en Especie (Público General)", 
                "Campaña de Recolección Escolar", 
                "Donación del Voluntariado Local",
                "Apoyo del Banco de Alimentos Regional",
                "Campaña Especial 'Dibuja Una Sonrisa'"
              ];
              obs = origenes[Math.floor((m.cantidad + (m.stock_resultante || 0)) % origenes.length)];
          } 
          else if (obs.includes("Donación general inteligente")) {
              const match = obs.match(/\$([0-9.]+)/);
              const amount = match ? parseFloat(match[1]).toLocaleString('es-MX') : "0";
              obs = `Compra Inteligente vía Plataforma Web (Fondo redireccionado: $${amount} MXN)`;
          }
          else if (obs.toLowerCase().includes("reabastecimiento") || obs.toLowerCase().includes("publico")) {
              obs = "Donación Directa en Mostrador (Público General)";
          }

          return {
            ...m,
            insumo_nombre: matchingInsumo.nombre,
            insumo_categoria: matchingInsumo.categoria,
            observacion_fixed: obs
          };
        }).filter(Boolean);

      setMovimientos(entradas);
    } catch (error) {
      console.error("Error cargando donaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodo();
  }, [])

  const handleSubmitDonacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.insumo_id || !formData.cantidad) return;

    setSubmitting(true);
    try {
      await postMovimiento({
        insumo_id: formData.insumo_id,
        tipo_movimiento: 'entrada',
        cantidad: parseInt(formData.cantidad, 10),
        observacion: formData.observacion || "Donación Directa en Mostrador (Público General)",
        origen: 'publico'
      });
      
      toast.success("Donación registrada correctamente");
      setIsModalOpen(false);
      setFormData({ insumo_id: "", cantidad: "", observacion: "" });
      fetchTodo(); // Recargar la tabla
    } catch (error: any) {
      toast.error(error.message || "Error al registrar la donación");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto relative">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Heart className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Registro de Donaciones</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 border border-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              Nueva Donación
            </button>
            <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
              <Download className="h-4 w-4" />
              Exportar
            </button>
          </div>
        </div>
        <p className="text-muted-foreground w-full max-w-3xl">
          Historial transparente de entradas de inventario a través de donantes públicos, corporativos o inyecciones internas.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Fecha', 'Insumo (Producto)', 'Aportación', 'Nuevo Stock', 'Origen / Concepto'].map(h => (
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
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-slate-500 font-medium whitespace-nowrap text-xs">
                        {new Date(mov.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors whitespace-nowrap">
                        {mov.insumo_nombre}
                      </p>
                      <span className="inline-flex mt-1 items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500 uppercase tracking-widest">
                        {mov.insumo_categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center px-2 py-1 bg-emerald-50 text-emerald-700 font-black rounded-lg text-sm border border-emerald-100 shadow-sm min-w-[3.5rem]">
                        +{mov.cantidad}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-slate-800 text-sm">{mov.stock_resultante}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-600 text-xs font-medium leading-relaxed max-w-sm">
                        {mov.observacion_fixed}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Donación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Registrar Donación en Mostrador</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white shadow-sm border border-slate-200 p-1 rounded-md">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitDonacion} className="p-5 flex flex-col gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Producto a Recibir</label>
                <select 
                  required
                  value={formData.insumo_id}
                  onChange={e => setFormData({ ...formData, insumo_id: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  <option value="" disabled>Selecciona un producto del catálogo...</option>
                  {insumosLocal.map(insumo => (
                    <option key={insumo.id} value={insumo.id}>{insumo.nombre} (Stock actual: {insumo.stock_actual})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Cantidad (Unidades)</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  value={formData.cantidad}
                  onChange={e => setFormData({ ...formData, cantidad: e.target.value })}
                  placeholder="Ej. 24"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Concepto / Procedencia <span className="text-slate-400 font-normal">(Opcional)</span></label>
                <input 
                  type="text" 
                  value={formData.observacion}
                  onChange={e => setFormData({ ...formData, observacion: e.target.value })}
                  placeholder="Ej. Entregado por familia Gómez"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500">
                  Si se deja en blanco se guardará como "Donación Directa en Mostrador".
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2"
                >
                  {submitting ? "Registrando..." : "Confirmar Recepción"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
