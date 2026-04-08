"use client"

import { useState, useEffect } from "react"
import { Users, BedDouble, Calendar, Plus, UserPlus, Users as UsersIcon, ChevronRight, Heart, BrainCircuit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getFamilias, getFamiliasStats, registrarFamilia, darAltaFamilia, darProrrogaFamilia } from "@/services/api"
import type { FamiliaPayload } from "@/services/api"
import { Loader2, PlusCircle } from "lucide-react"
import { getSessionUser } from "@/lib/auth"

export default function FamiliasPage() {
  const [familias, setFamilias] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sedeActiva, setSedeActiva] = useState<string>("cdmx")
  
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
  const loadData = async (sede: string) => {
    try {
      setLoading(true)
      const [fData, sData] = await Promise.all([
        getFamilias(sede),
        getFamiliasStats(sede)
      ])
      setFamilias(fData)
      setStats(sData)
    } catch (err: any) {
      setError(err.message || "Error al cargar familias")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    const user = getSessionUser()
    const sedeUser = user?.sede || "cdmx"
    setSedeActiva(sedeUser)
    
    // El formulario también se pre-llena con la sede del admin
    setForm(prev => ({...prev, sede: sedeUser}))
    
    loadData(sedeUser) 
  }, [])

  // Alta de familia
  const handleDarAlta = async (id: string) => {
    if (!confirm("¿Confirmar alta de esta familia?")) return
    try {
      await darAltaFamilia(id)
      loadData(sedeActiva)
    } catch (err: any) {
      alert("Error al dar de alta: " + err.message)
    }
  }

  // Dar Prórroga
  const handleProrroga = async (id: string) => {
    try {
      await darProrrogaFamilia(id)
      loadData(sedeActiva)
    } catch (err: any) {
      alert("Error al dar prórroga: " + err.message)
    }
  }

  // Registrar nueva familia
  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await registrarFamilia(form)
      setIsModalOpen(false)
      loadData(sedeActiva)
      // reset form
      setForm({
        sede: sedeActiva, numero_adultos: 1, numero_ninos: 0, dias_estancia_est: 7,
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

          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-indigo-50 md:col-span-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <BrainCircuit className="w-32 h-32" />
            </div>
            <CardContent className="p-4 flex items-center justify-between relative z-10">
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 bg-white/60 backdrop-blur-sm rounded-xl border border-white flex items-center justify-center text-purple-600 shadow-sm">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-900/80 mb-1 tracking-tight">Análisis Operativo CareForecast</p>
                  <p className="text-sm leading-snug text-slate-700">
                    Nuestra IA detecta un nivel de ocupación equivalente al <strong className="text-purple-700 font-bold bg-white/50 px-1 py-0.5 rounded">{Math.round(parseFloat(multiplicador) * 100)}%</strong> de la capacidad proyectada. 
                    Multiplicador exponencial aplicado al estrés de inventario.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Familias */}
      <h2 className="text-lg font-semibold mt-8 mb-2">Familias en Sede ({sedeActiva.toUpperCase()})</h2>
      
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
            <Card key={f.id} className="border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#DA291C]" />
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="font-semibold text-slate-900 truncate" title={f.paciente_referencia || 'Familia s/n'}>
                      Fam: {f.paciente_referencia || "Paciente No Reg."}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <BedDouble className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">Hab: {f.habitacion || "Asignar"}</span>
                    </p>
                  </div>
                  <Badge variant="outline" className="flex-shrink-0 bg-orange-50 text-orange-700 border-orange-200 font-medium tracking-tight">
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

                <div className="flex justify-between items-center bg-slate-50/50 -mx-5 -mb-5 px-5 py-3 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Ingreso</span>
                    <span className="text-xs text-slate-600">{new Date(f.fecha_ingreso).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleProrroga(f.id)} className="h-8 text-xs font-medium text-slate-600 hover:text-purple-700 hover:bg-purple-50 border-slate-200">
                      <PlusCircle className="h-3.5 w-3.5 mr-1" /> Prórroga
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDarAlta(f.id)} className="h-8 text-xs font-medium text-slate-600 hover:text-[#DA291C] hover:bg-red-50">
                      Dar de alta <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
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
                    <option value="cdmx">CDMX</option>
                    <option value="puebla">Puebla</option>
                    <option value="edomex">Estado de México</option>
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
