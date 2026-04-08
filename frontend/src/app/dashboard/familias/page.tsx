"use client"

import { useState, useEffect } from "react"
import { Users, BedDouble, Calendar, Plus, UserPlus, Users as UsersIcon, ChevronRight, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getFamilias, getFamiliasStats, registrarFamilia, darAltaFamilia } from "@/services/api"
import type { FamiliaPayload } from "@/services/api"
import { Loader2 } from "lucide-react"

export default function FamiliasPage() {
  const [familias, setFamilias] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState<FamiliaPayload>({
    sede: "cdmx",
    numero_adultos: 1,
    numero_ninos: 0,
    dias_estancia_est: 7,
    habitacion: "",
    paciente_edad: undefined,
    paciente_referencia: "",
    necesidades_especiales: ""
  })

  // Cargar datos
  const loadData = async () => {
    try {
      setLoading(true)
      const [fData, sData] = await Promise.all([
        getFamilias(),
        getFamiliasStats()
      ])
      setFamilias(fData)
      setStats(sData)
    } catch (err: any) {
      setError(err.message || "Error al cargar familias")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // Alta de familia
  const handleDarAlta = async (id: string) => {
    if (!confirm("¿Confirmar alta de esta familia?")) return
    try {
      await darAltaFamilia(id)
      loadData()
    } catch (err: any) {
      alert("Error al dar de alta: " + err.message)
    }
  }

  // Registrar nueva familia
  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await registrarFamilia(form)
      setIsModalOpen(false)
      loadData()
      // reset form
      setForm({
        sede: "cdmx", numero_adultos: 1, numero_ninos: 0, dias_estancia_est: 7,
        habitacion: "", paciente_edad: undefined, paciente_referencia: "", necesidades_especiales: ""
      })
    } catch (err: any) {
      alert("Error al registrar: " + err.message)
    }
  }

  // Variables para la UI calculadas
  const ocupacionReal = stats ? stats.total_adultos + stats.total_ninos : 0
  const OCUPACION_BASE = 50 // Same as backend
  const multiplicador = Math.max(1, ocupacionReal / OCUPACION_BASE).toFixed(2)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Gestión de Familias
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Operación Viva</Badge>
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Las familias registradas aquí alimentan el contexto en tiempo real para el motor predictivo de CareForecast.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#DA291C] hover:bg-[#b8221a] text-white">
          <Plus className="mr-2 h-4 w-4" /> Ingresar Familia
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4 flex gap-4 items-center">
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                <BedDouble className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Familias Activas</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total_activas}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4 flex gap-4 items-center">
              <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                <UsersIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Ocupación Total</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-slate-900">{ocupacionReal} <span className="text-sm font-normal text-slate-500">pax</span></p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 md:col-span-2">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Multiplicador CareForecast (Consumo)</p>
                  <p className="text-2xl font-bold text-slate-900">{multiplicador}x <span className="text-sm font-normal text-slate-500">sobre el baseline de {OCUPACION_BASE} pax.</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Familias */}
      <h2 className="text-lg font-semibold mt-8 mb-2">Familias en Sede (CDMX)</h2>
      
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : familias.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-xl border-slate-300 bg-white shadow-sm">
          <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No hay familias ingresadas en este momento.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {familias.map((f) => (
            <Card key={f.id} className="border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#DA291C]" />
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 truncate pr-2" title={f.paciente_referencia || 'Familia s/n'}>
                      Familia: {f.paciente_referencia || "Paciente No Reg."}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <BedDouble className="h-3 w-3" />
                      Hab: {f.habitacion || "Asignar"}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    {f.dias_estancia_est} d. est
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center text-sm py-3 border-y border-slate-100 mb-4 bg-slate-50/50 -mx-5 px-5">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <UserPlus className="h-4 w-4 text-slate-400" />
                    <span>Adultos: <strong className="text-slate-900">{f.numero_adultos}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Heart className="h-4 w-4 text-slate-400" />
                    <span>Niños: <strong className="text-slate-900">{f.numero_ninos}</strong></span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Ingreso: {new Date(f.fecha_ingreso).toLocaleDateString()}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleDarAlta(f.id)} className="h-8 text-slate-600 hover:text-[#DA291C] hover:bg-red-50">
                    Dar de alta <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Ingreso */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">Ingresar Familia</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleRegistrar} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Paciente (Ref)</label>
                  <input type="text" required value={form.paciente_referencia} onChange={e => setForm({...form, paciente_referencia: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#DA291C] outline-none" placeholder="Juan Pérez" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Edad Paciente</label>
                  <input type="number" value={form.paciente_edad || ''} onChange={e => setForm({...form, paciente_edad: parseInt(e.target.value) || undefined})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#DA291C] outline-none" placeholder="10" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-4 my-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adultos</label>
                  <input type="number" min="1" required value={form.numero_adultos} onChange={e => setForm({...form, numero_adultos: parseInt(e.target.value) || 1})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#DA291C] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Niños</label>
                  <input type="number" min="0" required value={form.numero_ninos} onChange={e => setForm({...form, numero_ninos: parseInt(e.target.value) || 0})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#DA291C] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Días Est</label>
                  <input type="number" min="1" required value={form.dias_estancia_est} onChange={e => setForm({...form, dias_estancia_est: parseInt(e.target.value) || 7})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#DA291C] outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Habitación</label>
                  <input type="text" value={form.habitacion} onChange={e => setForm({...form, habitacion: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#DA291C] outline-none" placeholder="B12" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sede</label>
                  <select value={form.sede} onChange={e => setForm({...form, sede: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#DA291C] outline-none bg-white">
                    <option value="cdmx">Sede Central (CDMX)</option>
                    <option value="gdl">Sede Occidente (GDL)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-[#DA291C] hover:bg-[#b8221a] text-white">Salvar Ingreso</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
