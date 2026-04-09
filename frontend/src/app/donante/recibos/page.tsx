"use client"

import { useState } from "react"
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  AlertCircle
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const recibosMock = [
  {
    id: "RF-2026-004",
    fecha: "15 Abr 2026",
    monto: 500,
    concepto: "Aportación Mensual General",
    estado: "Emitido",
  },
  {
    id: "RF-2026-003",
    fecha: "15 Mar 2026",
    monto: 500,
    concepto: "Aportación Mensual General",
    estado: "Emitido",
  },
  {
    id: "RF-2026-002",
    fecha: "08 Mar 2026",
    monto: 1200,
    concepto: "Kits de Admisión Hospitalaria",
    estado: "Emitido",
  },
  {
    id: "RF-2026-001",
    fecha: "15 Feb 2026",
    monto: 500,
    concepto: "Aportación Mensual General",
    estado: "Emitido",
  },
  {
    id: "RF-2025-012",
    fecha: "28 Ene 2026",
    monto: 2500,
    concepto: "Remodelación Cocina CDMX",
    estado: "Emitido",
  },
]

export default function RecibosFiscalesPage() {
  const totalDeducible = recibosMock.reduce((acc, curr) => acc + curr.monto, 0)

  return (
    <div className="flex flex-col h-full gap-6 max-w-[1400px] w-full mx-auto pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Recibos Fiscales</h1>
          <p className="text-slate-500 text-sm mt-1">
            Consulta y descarga tus comprobantes fiscales digitales por internet (CFDI).
          </p>
        </div>
        <Button className="bg-[#DB0007] hover:bg-[#b8221a] text-white gap-2 h-10 w-full sm:w-auto">
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
              <p className="text-sm font-medium text-slate-500">Total Deducible (Aprox)</p>
              <h3 className="text-2xl font-bold text-slate-900">${totalDeducible.toLocaleString()} MXN</h3>
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
              <h3 className="text-2xl font-bold text-slate-900">{recibosMock.length}</h3>
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
          <CardTitle className="text-lg">Historial de Recibos</CardTitle>
          <CardDescription>
            Tus aportaciones son deducibles de impuestos de acuerdo a la ley vigente.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-[120px] font-semibold text-slate-600">Folio</TableHead>
                <TableHead className="font-semibold text-slate-600">Fecha</TableHead>
                <TableHead className="font-semibold text-slate-600">Concepto</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Monto</TableHead>
                <TableHead className="text-center font-semibold text-slate-600">Documentos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recibosMock.map((recibo) => (
                <TableRow key={recibo.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-medium text-slate-900">{recibo.id}</TableCell>
                  <TableCell className="text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {recibo.fecha}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 truncate max-w-[200px]">{recibo.concepto}</TableCell>
                  <TableCell className="text-right font-bold text-slate-900 text-sm">
                    ${recibo.monto.toLocaleString()} <span className="text-xs font-normal text-slate-500">MXN</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="outline" size="sm" className="h-7 text-[11px] font-semibold px-2.5 rounded-lg bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 hover:text-pink-800 transition-colors">
                        <Download className="w-3 h-3 mr-1" /> PDF
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-[11px] font-semibold px-2.5 rounded-lg bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 transition-colors">
                        <Download className="w-3 h-3 mr-1" /> XML
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 shrink-0">
        <p><strong>Nota importante:</strong> Los recibos fiscales se generan de forma automática en los primeros 5 días hábiles del mes siguiente a tu donación. Si no encuentras un recibo reciente, revisa nuevamente en esa fecha.</p>
      </div>
    </div>
  )
}
