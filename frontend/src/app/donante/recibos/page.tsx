"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  AlertCircle,
  FileX
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { getSessionUser } from "@/lib/auth"
import { getRecibosDonante } from "@/services/donanteApi"

export default function RecibosFiscalesPage() {
  const [recibos, setRecibos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecibos = async () => {
      setLoading(true)
      setError(null)
      try {
        const user = getSessionUser()
        if (!user) return

        const data = await getRecibosDonante(user.usuario_id)
        setRecibos(Array.isArray(data) ? data : [])
      } catch (err: any) {
        console.error("Error al obtener recibos:", err)
        setError("No se pudo cargar el historial de recibos. Intenta de nuevo más tarde.")
        setRecibos([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchRecibos()
  }, [])

  const recibosFacturados = recibos.filter(r => r.estatus === "Facturado" || r.estatus === "Completado")
  const totalDeducible = recibosFacturados.reduce((acc, curr) => acc + (curr.monto || 0), 0)

  return (
    <div className="flex flex-col h-full gap-6 max-w-[1400px] w-full mx-auto pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Recibos Fiscales</h1>
          <p className="text-slate-500 text-sm mt-1">
            Consulta y descarga tus comprobantes fiscales digitales por internet (CFDI).
          </p>
        </div>
        <Button className="bg-[#DB0007] hover:bg-[#b8221a] text-white gap-2 h-10 w-full sm:w-auto" disabled={recibosFacturados.length === 0}>
          <Download className="w-4 h-4" />
          Descargar Resumen Anual
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Deducible</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {loading ? (
                  <div className="h-7 w-20 bg-slate-200 animate-pulse rounded mt-1" />
                ) : (
                  `$${totalDeducible.toLocaleString()} MXN`
                )}
              </h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Recibos Emitidos</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {loading ? (
                  <div className="h-7 w-12 bg-slate-200 animate-pulse rounded mt-1" />
                ) : (
                  recibosFacturados.length
                )}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-slate-600" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-500">RFC Principal</p>
              <h3 className="text-[17px] font-bold text-slate-900 truncate">XAXX010101000</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm flex-1 min-h-0 flex flex-col">
        <CardHeader className="border-b border-border/50 bg-slate-50/50 pb-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Historial de Recibos</CardTitle>
              <CardDescription>
                Tus aportaciones son deducibles de impuestos de acuerdo a la ley vigente.
              </CardDescription>
            </div>
            {error && (
              <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100">
                {error}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-auto">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex gap-4 p-2 items-center rounded bg-slate-50 animate-pulse">
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-4 flex-1 bg-slate-200 rounded" />
                  <div className="h-4 w-16 bg-slate-200 rounded" />
                  <div className="h-8 w-24 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : recibos.length === 0 && !error ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <FileX className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-600">No hay recibos fiscales registrados</p>
              <p className="text-sm">Tus recibos aparecerán aquí una vez generados por el sistema.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="w-[120px] font-semibold text-slate-600">Folio</TableHead>
                  <TableHead className="font-semibold text-slate-600">Fecha</TableHead>
                  <TableHead className="font-semibold text-slate-600">Concepto</TableHead>
                  <TableHead className="text-center font-semibold text-slate-600">Estatus</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Monto</TableHead>
                  <TableHead className="text-center font-semibold text-slate-600">Documentos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recibos.map((recibo, index) => {
                  const isFacturado = recibo.estatus === "Facturado" || recibo.estatus === "Completado"
                  const isPendiente = recibo.estatus === "Pendiente"
                  
                  return (
                    <TableRow key={recibo.folio || index} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-900">{recibo.folio || "---"}</TableCell>
                      <TableCell className="text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {recibo.fecha_emision ? new Date(recibo.fecha_emision).toLocaleDateString("es-MX", { day: '2-digit', month: 'short', year: 'numeric'}) : "Reciente"}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 truncate max-w-[200px]">{recibo.concepto || "Donación"}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn(
                          "text-[10px] uppercase font-bold",
                          isFacturado && "bg-emerald-50 text-emerald-600 border-emerald-200",
                          isPendiente && "bg-amber-50 text-amber-600 border-amber-200"
                        )}>
                          {recibo.estatus || "Pendiente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-900 text-sm">
                        ${(recibo.monto || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">MXN</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={!isFacturado || !recibo.url_pdf}
                            onClick={() => window.open(recibo.url_pdf, '_blank')}
                            className="h-7 text-[11px] font-semibold px-2.5 rounded-lg border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            <Download className="w-3 h-3 mr-1" /> PDF
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={!isFacturado || !recibo.url_xml}
                            onClick={() => window.open(recibo.url_xml, '_blank')}
                            className="h-7 text-[11px] font-semibold px-2.5 rounded-lg border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Download className="w-3 h-3 mr-1" /> XML
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 shrink-0">
        <p><strong>Nota importante:</strong> Los recibos fiscales se generan de forma automática en los primeros 5 días hábiles del mes siguiente a tu donación. Si no encuentras un recibo reciente con estatus &quot;Facturado&quot;, por favor revisa nuevamente en esa fecha.</p>
      </div>
    </div>
  )
}
