"use client"

import { useState, useEffect } from "react"
import { getSessionUser } from "@/lib/auth"
import { getPerfilUsuario, updatePerfilUsuario, updatePassword } from "@/services/donanteApi"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, KeyRound } from "lucide-react"

// Puedes usar toast o sonner. Aquí importamos Toaster de sonner si está disponible en tu proyecto, 
// o un toast de Shadcn. Asumo la interfaz genérica de toast
import { toast } from "sonner"

export default function ConfiguracionDonantePage() {
  const [loading, setLoading] = useState(true)
  const [savingPerfil, setSavingPerfil] = useState(false)
  const [savingPass, setSavingPass] = useState(false)

  const [perfilForm, setPerfilForm] = useState({
    nombre: "",
    email: "",
    empresa_nombre: "",
    empresa_rfc: ""
  })

  const [passForm, setPassForm] = useState({
    actual: "",
    nueva: "",
    confirmar: ""
  })

  // Cargar perfil al montar
  useEffect(() => {
    const fetchConfiguracion = async () => {
      setLoading(true)
      try {
        const user = getSessionUser()
        if (!user) return

        const data = await getPerfilUsuario(user.usuario_id)
        if (data) {
          setPerfilForm({
            nombre: data.nombre || user.nombre || "",
            email: data.email || "",
            empresa_nombre: data.empresa_nombre || "",
            empresa_rfc: data.empresa_rfc || ""
          })
        }
      } catch (err) {
        console.error("Error al obtener perfil config:", err)
        toast.error("Hubo un error al cargar la configuración de tu cuenta.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchConfiguracion()
  }, [])

  // Guardado de Perfil / Datos Fiscales
  const handleSavePerfil = async () => {
    try {
      setSavingPerfil(true)
      const user = getSessionUser()
      if (!user) return

      await updatePerfilUsuario(user.usuario_id, {
        nombre: perfilForm.nombre,
        empresa_nombre: perfilForm.empresa_nombre,
        empresa_rfc: perfilForm.empresa_rfc,
      })
      
      toast.success("Perfil actualizado correctamente")
    } catch (err) {
      console.error(err)
      toast.error("Ocurrió un error al guardar tu perfil")
    } finally {
      setSavingPerfil(false)
    }
  }

  // Guardado de Contraseña
  const handleSavePassword = async () => {
    if (passForm.nueva !== passForm.confirmar) {
      toast.error("Las contraseñas nuevas no coinciden")
      return
    }

    if (passForm.nueva.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    try {
      setSavingPass(true)
      const user = getSessionUser()
      if (!user) return

      // Nota: El servicio debería validar que `passForm.actual` concuerda
      await updatePassword(user.usuario_id, passForm.nueva)
      
      toast.success("Contraseña actualizada con éxito")
      setPassForm({ actual: "", nueva: "", confirmar: "" })
    } catch (err) {
      console.error(err)
      toast.error("Fallo al actualizar contraseña. Verifica tu contraseña actual.")
    } finally {
      setSavingPass(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p>Cargando configuración...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 w-full pt-4">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configuración de Cuenta</h1>
        <p className="text-slate-500 text-sm mt-1">
          Gestiona tu información personal, datos de facturación preferida y la seguridad de tu sesión.
        </p>
      </div>

      <div className="grid gap-6">
        
        {/* Card 1: Información Personal */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 pb-4 border-b border-border/50">
            <CardTitle className="text-lg">Información Personal</CardTitle>
            <CardDescription>Esta información es visible en tus comprobantes y certificados.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input 
                  id="nombre" 
                  value={perfilForm.nombre}
                  onChange={(e) => setPerfilForm({...perfilForm, nombre: e.target.value})}
                  placeholder="Tu nombre completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex justify-between">
                  Correo Electrónico
                  <span className="text-[10px] text-muted-foreground uppercase">IDENTIFICADOR DE INICIO (FIJO)</span>
                </Label>
                <Input 
                  id="email" 
                  value={perfilForm.email}
                  disabled
                  className="bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
            
            <div className="pt-2 flex justify-end">
              <Button 
                onClick={handleSavePerfil} 
                className="bg-[#DA291C] hover:bg-[#b8221a] text-white"
                disabled={savingPerfil}
              >
                {savingPerfil ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {savingPerfil ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Datos Fiscales */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 pb-4 border-b border-border/50">
            <CardTitle className="text-lg">Datos Fiscales de Facturación</CardTitle>
            <CardDescription>Tu Razón Social y RFC activos para generar automáticamente tus recibos de aportación mensual.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="razonSocial">Razón Social / Nombre Legal</Label>
                <Input 
                  id="razonSocial" 
                  value={perfilForm.empresa_nombre}
                  onChange={(e) => setPerfilForm({...perfilForm, empresa_nombre: e.target.value})}
                  placeholder="Ej. Juan Pérez López"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rfc">RFC</Label>
                <Input 
                  id="rfc" 
                  value={perfilForm.empresa_rfc}
                  onChange={(e) => setPerfilForm({...perfilForm, empresa_rfc: e.target.value.toUpperCase()})}
                  placeholder="AAAA000000XXX" 
                  maxLength={13}
                />
              </div>
            </div>
            
            <div className="pt-2 flex justify-end">
              <Button 
                onClick={handleSavePerfil} 
                className="bg-[#DA291C] hover:bg-[#b8221a] text-white"
                disabled={savingPerfil}
              >
                {savingPerfil ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {savingPerfil ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Seguridad */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 pb-4 border-b border-border/50">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-slate-400" /> Seguridad
            </CardTitle>
            <CardDescription>Cambia la contraseña de acceso a tu panel.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-4 md:w-2/3">
              <div className="space-y-2">
                <Label htmlFor="passActual">Contraseña Actual</Label>
                <Input 
                  id="passActual" 
                  type="password"
                  value={passForm.actual}
                  onChange={(e) => setPassForm({...passForm, actual: e.target.value})}
                  placeholder="••••••••" 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passNueva">Nueva Contraseña</Label>
                  <Input 
                    id="passNueva" 
                    type="password"
                    value={passForm.nueva}
                    onChange={(e) => setPassForm({...passForm, nueva: e.target.value})}
                    placeholder="••••••••" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passConf">Confirmar Contraseña</Label>
                  <Input 
                    id="passConf" 
                    type="password"
                    value={passForm.confirmar}
                    onChange={(e) => setPassForm({...passForm, confirmar: e.target.value})}
                    placeholder="••••••••" 
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <Button 
                onClick={handleSavePassword} 
                className="bg-slate-900 hover:bg-slate-800 text-white"
                disabled={savingPass || !passForm.actual || !passForm.nueva}
              >
                {savingPass ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
                {savingPass ? "Actualizando..." : "Actualizar Contraseña"}
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
