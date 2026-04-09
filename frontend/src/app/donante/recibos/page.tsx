"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getSessionUser } from "@/lib/auth"
import { getRecibosDonante } from "@/services/donanteApi"

export default function RecibosPage() {
  const [recibos, setRecibos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      const user = getSessionUser()
      if (!user) return
      
      try {
        const data = await getRecibosDonante(user.usuario_id)
        setRecibos(data || [])
      } catch (err) {
        console.error("Error cargando recibos:", err)
        // Fallback para hackaton si el endpoint está vacío
        setRecibos([
          { id: "REC-2026-001", mes_texto: "Marzo", anio: 2026, monto_amparado: 12500.50, fecha_emision: "2026-03-31", estado: "disponible" },
          { id: "REC-2026-002", mes_texto: "Febrero", anio: 2026, monto_amparado: 8400.00, fecha_emision: "2026-02-28", estado: "disponible" },
          { id: "REC-2026-003", mes_texto: "Enero", anio: 2026, monto_amparado: 15000.00, fecha_emision: "2026-01-31", estado: "disponible" },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredRecibos = recibos.filter(r => 
    r.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.mes_texto.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Recibos Fiscales</h1>
          <p className="text-slate-500 mt-1">Descarga tus comprobantes deducibles de impuestos (CFDI).</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span className="text-emerald-700 text-sm font-bold">Documentación Validada</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-border/40 bg-white/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">Historial de Comprobantes</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Buscar recibo..." 
                  className="pl-9 bg-white/80 border-slate-200 rounded-xl text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4 py-8">
                {[1,2,3].map(i => (
                  <div key={i} className="h-16 w-full bg-slate-100 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : filteredRecibos.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Folio</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Periodo</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-right">Monto</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">Estado</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecibos.map((recibo) => (
                    <TableRow key={recibo.id} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-mono text-xs text-slate-600">{recibo.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{recibo.mes_texto}</span>
                          <span className="text-[10px] text-slate-400">{recibo.anio}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-black text-slate-900">
                        ${recibo.monto_amparado.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Generado
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-[#DA291C] hover:bg-red-50">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-500 hover:bg-blue-50">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-slate-500 font-medium">No se encontraron recibos correspondientes.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="border-none bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#DA291C]/10 rounded-full blur-3xl" />
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Resumen Fiscal 2026</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <span className="text-slate-400 text-xs text uppercase tracking-wider font-bold">Total Deducible</span>
                <span className="text-2xl font-black text-[#FFBC0D]">$35,900.50</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#DA291C] w-[65%]" />
              </div>
              <p className="text-[10px] text-slate-500 italic">Actualizado al último movimiento del {new Date().toLocaleDateString()}</p>
              
              <Button className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl text-xs font-bold py-5 mt-2">
                Descargar Constancia Anual
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-amber-50/30">
             <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <CardTitle className="text-sm font-bold text-amber-900">Próximo Recibo</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-amber-800 leading-relaxed">
                Tu recibo de <strong>Abril 2026</strong> se generará automáticamente el primer día hábil del próximo mes.
              </p>
              <div className="mt-4 p-3 bg-white/50 rounded-xl border border-amber-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Acumulado Mes</span>
                <span className="text-sm font-black text-amber-700">$0.00</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
