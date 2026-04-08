"use client"

import { useState } from "react"
import { Heart, Lock, FileText, AlertTriangle, Clock, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { postMovimiento } from "@/services/api"
import {
  generateDonationCertificate,
  getLoggedUserName,
} from "@/lib/generateDonationCertificate";

// ── Tipos ───────────────────────────────────────────────────────────────────

interface MissionForModal {
  id: string
  title: string
  emotion: string
  image: string
  raised: number
  goal: number
  percent: number
  timeLeft: string
  donors: number
  beneficiaries: string
  urgency: "high" | "medium" | "low"
  raw: {
    id: string
    consumo_diario: number
    stock_actual: number
    capacidad_maxima: number
    nivel_critico: number
    costo_unitario: number
    categoria: string
  }
}

interface DonationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mission: MissionForModal | null
}

// ── Constantes ───────────────────────────────────────────────────────────────

const PRESET_AMOUNTS = [100, 250, 500]

const urgencyLabels: Record<string, { label: string; color: string; bg: string }> = {
  high:   { label: "Urgencia Crítica",  color: "text-red-700",   bg: "bg-red-50 border-red-200"   },
  medium: { label: "En Atención",       color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  low:    { label: "Estable",           color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
}

// ── Componente ───────────────────────────────────────────────────────────────

export function DonationModal({ open, onOpenChange, mission }: DonationModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(250)
  const [customAmount, setCustomAmount] = useState("")
  const [isCustom, setIsCustom] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [donated, setDonated] = useState(false)

  if (!mission) return null

  const raw = mission.raw
  const costoUnitario = raw.costo_unitario > 0 ? raw.costo_unitario : 85
  const finalAmount = isCustom ? (parseInt(customAmount) || 0) : (selectedAmount || 0)

  // Calcular cuántas unidades cubre la donación y días de cobertura
  const unidadesCubiertas = finalAmount > 0 ? Math.max(1, Math.floor(finalAmount / costoUnitario)) : 0
  const diasCubiertos = raw.consumo_diario > 0
    ? Math.round(unidadesCubiertas / raw.consumo_diario)
    : 0

  const urgencyInfo = urgencyLabels[mission.urgency] ?? urgencyLabels.low
  const stockPercent = Math.min(100, Math.round((raw.stock_actual / raw.capacidad_maxima) * 100))

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setIsCustom(false)
    setCustomAmount("")
  }

  const handleDonate = async () => {
    if (finalAmount <= 0) return
    setIsSubmitting(true)

    try {
      const cantidad = Math.max(1, Math.floor(finalAmount / costoUnitario))

      await postMovimiento({
        insumo_id: raw.id,
        tipo_movimiento: "entrada",
        cantidad,
        observacion: `Donación pública $${finalAmount} MXN — ${unidadesCubiertas} uds (${diasCubiertos} días)`,
        origen: "publico",
      })

      generateDonationCertificate({
        donorName: getLoggedUserName(),
        donationType: "insumo",
        itemName: mission.title,
        amount: finalAmount,
        createdAt: new Date(),
      })

      setDonated(true)
    } catch (err) {
      console.error("Error en donación:", err)
      alert("Hubo un error procesando la donación. Intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setDonated(false)
    setSelectedAmount(250)
    setCustomAmount("")
    setIsCustom(false)
    onOpenChange(false)
  }

  // ── Pantalla de éxito ────────────────────────────────────────────────────
  if (donated) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogDescription className="sr-only">Donación exitosa</DialogDescription>
          <div className="flex flex-col items-center justify-center p-10 text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <Heart className="w-10 h-10 text-[#DA291C] fill-[#DA291C]" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">¡Gracias por donar!</h2>
            <p className="text-slate-500 leading-relaxed">
              Tu donación de{" "}
              <strong className="text-slate-800">${finalAmount} MXN</strong>{" "}
              aportará{" "}
              <strong className="text-slate-800">{unidadesCubiertas} unidades</strong>{" "}
              de <em>{mission.title}</em>, cubriendo aproximadamente{" "}
              <strong className="text-slate-800">{diasCubiertos} días</strong> de necesidad.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
              "Gracias a donadores como tú, nuestra familia pudo estar cerca de mi hijo durante su tratamiento."
              <p className="mt-2 text-xs text-slate-400">— María G., Madre beneficiaria</p>
            </div>
            <Button onClick={handleClose} className="w-full bg-[#DA291C] hover:bg-[#b8221a] text-white">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // ── Formulario de donación ───────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        <div className="grid md:grid-cols-2">

          {/* ── Columna izquierda: Impacto ── */}
          <div className="relative flex flex-col bg-slate-900 text-white overflow-hidden">
            {/* Imagen con overlay */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={mission.image}
                alt={mission.title}
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-slate-900/90" />
              <div className={cn(
                "absolute top-4 left-4 flex items-center gap-1.5 border rounded-full px-3 py-1",
                urgencyInfo.bg
              )}>
                {mission.urgency === "high" && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                  </span>
                )}
                <span className={cn("text-xs font-semibold", urgencyInfo.color)}>
                  {urgencyInfo.label}
                </span>
              </div>
            </div>

            <div className="flex-1 p-6 flex flex-col gap-4">
              <DialogHeader>
                <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                  <Heart className="size-3" />
                  Misión Activa
                </div>
                <DialogTitle className="text-xl font-bold text-white leading-tight mt-2">
                  {mission.title}
                </DialogTitle>
                <DialogDescription className="text-white/70 text-sm leading-relaxed mt-1">
                  {mission.emotion}
                </DialogDescription>
              </DialogHeader>

              {/* Métricas de urgencia */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-white/60 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">Tiempo restante</span>
                  </div>
                  <span className="font-bold text-base">{mission.timeLeft}</span>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-white/60 mb-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span className="text-xs">Stock actual</span>
                  </div>
                  <span className="font-bold text-base">{raw.stock_actual} uds</span>
                </div>
              </div>

              {/* Barra de inventario */}
              <div className="space-y-2 mt-auto">
                <div className="flex justify-between text-xs text-white/60">
                  <span>Nivel de inventario</span>
                  <span>{raw.stock_actual} / {raw.capacidad_maxima} uds</span>
                </div>
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      stockPercent < 30 ? "bg-red-500" : stockPercent < 60 ? "bg-amber-400" : "bg-emerald-400"
                    )}
                    style={{ width: `${stockPercent}%` }}
                  />
                </div>
                {raw.stock_actual <= raw.nivel_critico && (
                  <div className="flex items-center gap-1.5 text-red-300 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Por debajo del nivel crítico ({raw.nivel_critico} uds)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Columna derecha: Formulario ── */}
          <div className="p-6 md:p-8 flex flex-col">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Elige tu donación</h3>
            <p className="text-sm text-slate-500 mb-6">
              Precio unitario: <strong className="text-slate-700">${costoUnitario.toLocaleString()} MXN</strong>
            </p>

            {/* Montos preestablecidos */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {PRESET_AMOUNTS.map((amount) => {
                const uds = Math.max(1, Math.floor(amount / costoUnitario))
                return (
                  <button
                    key={amount}
                    onClick={() => handleAmountSelect(amount)}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border-2 p-3 transition-all",
                      selectedAmount === amount && !isCustom
                        ? "border-[#DA291C] bg-red-50 text-[#DA291C]"
                        : "border-slate-200 hover:border-red-200 text-slate-700"
                    )}
                  >
                    <span className="text-lg font-bold">${amount}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{uds} uds</span>
                  </button>
                )
              })}
            </div>

            {/* Monto personalizado */}
            <div className="mb-6">
              <label className="mb-2 block text-sm text-slate-500">
                O ingresa otro monto (MXN):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <Input
                  type="number"
                  min={1}
                  placeholder="Cantidad personalizada"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    setIsCustom(true)
                    setSelectedAmount(null)
                  }}
                  className={cn("pl-7", isCustom && customAmount && "border-[#DA291C]")}
                />
              </div>
            </div>

            {/* Preview de impacto */}
            {finalAmount > 0 && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4">
                <p className="text-sm text-slate-700">
                  Con{" "}
                  <strong className="text-[#DA291C]">${finalAmount.toLocaleString()} MXN</strong>{" "}
                  aportas{" "}
                  <strong>{unidadesCubiertas} unidad{unidadesCubiertas !== 1 ? "es" : ""}</strong>{" "}
                  de <em>{mission.title}</em> —{" "}
                  {diasCubiertos > 0
                    ? <>cubriendo <strong>{diasCubiertos} día{diasCubiertos !== 1 ? "s" : ""}</strong> de necesidad.</>
                    : "suficiente para apoyar esta misión."
                  }
                </p>
              </div>
            )}

            {/* Botón de donación */}
            <Button
              className="w-full gap-2 py-6 text-base bg-[#DA291C] hover:bg-[#b8221a] text-white mt-auto"
              disabled={finalAmount <= 0 || isSubmitting}
              onClick={handleDonate}
            >
              <Heart className="size-5" />
              {isSubmitting ? "Procesando..." : `Donar $${finalAmount > 0 ? finalAmount.toLocaleString() : "—"} MXN`}
            </Button>

            {/* Sellos de seguridad */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                    <Lock className="size-3.5" />
                    Donación Segura
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Tu información está protegida con encriptación SSL de 256 bits.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                    <FileText className="size-3.5" />
                    Deducible de Impuestos
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Tu donación es 100% deducible. Recibirás recibo fiscal en 24 horas.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
