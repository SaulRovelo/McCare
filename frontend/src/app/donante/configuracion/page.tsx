"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  User, 
  Mail, 
  Building2, 
  FileCheck, 
  Lock, 
  Save, 
  Camera,
  Shield,
  Bell,
  CreditCard
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSessionUser } from "@/lib/auth"
import { getPerfilUsuario, updatePerfilUsuario, updatePassword } from "@/services/donanteApi"

export default function ConfigPage() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form states
  const [nombre, setNombre] = useState("")
  const [empresa, setEmpresa] = useState("")
  const [rfc, setRfc] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      const user = getSessionUser()
      if (!user) return
      
      try {
        const data = await getPerfilUsuario(user.usuario_id)
        setUserData(data)
        setNombre(data.nombre || "")
        setEmpresa(data.empresa_nombre || "")
        setRfc(data.empresa_rfc || "")
        setEmail(data.email || "")
      } catch (err) {
        console.error("Error cargando datos de cuenta:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = getSessionUser()
    if (!user) return
    
    setSaving(true)
    try {
      await updatePerfilUsuario(user.usuario_id, {
        nombre,
        empresa_nombre: empresa,
        empresa_rfc: rfc
      })
      alert("Configuración actualizada con éxito")
    } catch (err) {
      console.error("Error actualizando perfil:", err)
      alert("Ocurrió un error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Configuración</h1>
        <p className="text-slate-500 mt-1">Gestiona tu perfil, preferencias y seguridad de tu cuenta.</p>
      </div>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="bg-slate-100/80 p-1 rounded-2xl mb-6">
          <TabsTrigger value="perfil" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <User className="w-4 h-4 mr-2" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="fiscal" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <FileCheck className="w-4 h-4 mr-2" /> Datos Fiscales
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Lock className="w-4 h-4 mr-2" /> Seguridad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-border/40 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Información Personal</CardTitle>
                <CardDescription>Esta información será visible en tu panel y constancias de agradecimiento.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-xs font-bold uppercase text-slate-500">Nombre Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          id="nombre" 
                          value={nombre} 
                          onChange={(e) => setNombre(e.target.value)} 
                          className="pl-10 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-bold uppercase text-slate-500">Correo Electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          id="email" 
                          value={email} 
                          disabled 
                          className="pl-10 rounded-xl bg-slate-50"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t flex justify-end">
                    <Button type="submit" disabled={saving} className="bg-[#DA291C] hover:bg-[#b8221a] text-white px-8 rounded-xl font-bold">
                      {saving ? "Guardando..." : <><Save className="w-4 h-4 mr-2" /> Guardar Cambios</>}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border/40 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#DA291C]/5 rounded-full blur-2xl" />
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="relative group cursor-pointer mb-4">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#DA291C] to-[#FFBC0D] p-1 shadow-lg group-hover:rotate-3 transition-transform">
                      <div className="w-full h-full rounded-[22px] bg-white flex items-center justify-center overflow-hidden">
                        <span className="text-2xl font-black text-slate-900">{nombre.substring(0,2).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-white shadow-md border flex items-center justify-center text-slate-500 group-hover:bg-[#DA291C] group-hover:text-white transition-colors">
                      <Camera className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900">{nombre}</h3>
                  <p className="text-xs text-slate-500 mt-1">Donante desde Marzo 2026</p>
                  <Badge className="mt-4 bg-amber-500/10 text-amber-600 border-amber-200">Nivel Plata</Badge>
                </CardContent>
              </Card>
              
              <Card className="border-border/40 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold">Insignias Obtenidas</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                   {[
                     { label: "Pionero", color: "bg-blue-100 text-blue-700" },
                     { label: "Impacto Constante", color: "bg-red-100 text-red-700" },
                     { label: "Benefactor CDMX", color: "bg-slate-100 text-slate-700" }
                   ].map(b => <span key={b.label} className={`text-[10px] font-bold px-2 py-1 rounded-lg ${b.color}`}>{b.label}</span>)}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fiscal">
          <Card className="border-border/40 bg-white max-w-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Datos de Facturación</CardTitle>
              <CardDescription>Configura los datos que aparecerán en tus recibos fiscales mensuales.</CardDescription>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="empresa" className="text-xs font-bold uppercase text-slate-500">Razón Social</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        id="empresa" 
                        placeholder="Nombre de la empresa o persona física" 
                        value={empresa}
                        onChange={(e) => setEmpresa(e.target.value)}
                        className="pl-10 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rfc" className="text-xs font-bold uppercase text-slate-500">RFC</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        id="rfc" 
                        placeholder="RFC con homoclave" 
                        value={rfc}
                        onChange={(e) => setRfc(e.target.value)}
                        className="pl-10 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4 text-blue-600" />
                   </div>
                   <p className="text-xs text-blue-700 leading-relaxed">
                     Recuerda que tus datos deben coincidir con tu Constancia de Situación Fiscal actualizada para que el recibo sea válido ante el SAT.
                   </p>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button type="submit" disabled={saving} className="bg-[#DA291C] hover:bg-[#b8221a] text-white px-8 rounded-xl font-bold">
                    {saving ? "Actualizando..." : "Actualizar Datos Fiscales"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguridad">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-border/40 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Cambiar Contraseña</CardTitle>
                <CardDescription>Para mayor seguridad, te recomendamos cambiar tu contraseña periódicamente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold">Contraseña Actual</Label>
                  <Input type="password" placeholder="••••••••" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold">Nueva Contraseña</Label>
                  <Input type="password" placeholder="Mínimo 8 caracteres" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold">Confirmar Nueva Contraseña</Label>
                  <Input type="password" placeholder="Repite la contraseña" className="rounded-xl" />
                </div>
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl mt-4 font-bold">
                  Actualizar Contraseña
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Preferencias</CardTitle>
                <CardDescription>Controla tus notificaciones y privacidad.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-slate-800">Recibir Alertas Críticas</span>
                       <span className="text-[11px] text-slate-500">Notificar cuando un insumo de mi interés se agote.</span>
                    </div>
                    <div className="w-10 h-5 bg-[#DA291C] rounded-full relative cursor-pointer">
                       <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-slate-800">Resumen Mensual de Impacto</span>
                       <span className="text-[11px] text-slate-500">Enviar reporte de familias ayudadas cada mes.</span>
                    </div>
                    <div className="w-10 h-5 bg-[#DA291C] rounded-full relative cursor-pointer">
                       <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-slate-800">Perfil Público de Donante</span>
                       <span className="text-[11px] text-slate-500">Mostrar mi nombre en el muro de agradecimientos.</span>
                    </div>
                    <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-pointer">
                       <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                 </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
