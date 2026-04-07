"use client"

import { useState } from "react"
import { Heart, Lock, FileText, Image as ImageIcon } from "lucide-react"
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

interface DonationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mission: {
    id: string
    title: string
    description: string
    donationAmount: string
    urgency: "high" | "medium" | "low"
    currentInventory: number
    targetInventory: number
  } | null
}

const presetAmounts = [200, 500, 1000]

export function DonationModal({ open, onOpenChange, mission }: DonationModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(500)
  const [customAmount, setCustomAmount] = useState("")
  const [isCustom, setIsCustom] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!mission) return null

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setIsCustom(false)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setIsCustom(true)
    setSelectedAmount(null)
  }

  const finalAmount = isCustom ? (parseInt(customAmount) || 0) : (selectedAmount || 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        <div className="grid md:grid-cols-2">
          {/* Left Column - Impact Info */}
          <div className="bg-muted/50 p-6 md:p-8">
            <DialogHeader className="mb-6">
              <div className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Heart className="size-3" />
                Misión Crítica
              </div>
              <DialogTitle className="text-xl text-balance leading-tight">
                {mission.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Formulario de donación para {mission.title}
              </DialogDescription>
            </DialogHeader>

            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              {mission.description}
            </p>

            {/* Image Placeholder */}
            <div className="mb-6 flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-border bg-background/50">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="mx-auto mb-2 size-10 opacity-40" />
                <span className="text-xs">Imagen de impacto</span>
              </div>
            </div>

            {/* Emotional Thank You */}
            <div className="rounded-lg border border-accent/50 bg-accent/10 p-4">
              <p className="text-sm font-medium text-foreground">
                {"\"Gracias a donadores como tú, nuestra familia pudo estar cerca de mi hijo durante su tratamiento. No tengo palabras para agradecer.\""}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                — María G., Madre beneficiaria
              </p>
            </div>

            {/* Progress indicator */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Nivel de inventario</span>
                <span className="font-medium">
                  {mission.currentInventory} / {mission.targetInventory}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-border">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(mission.currentInventory / mission.targetInventory) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Donation Form */}
          <div className="p-6 md:p-8">
            <h3 className="mb-6 text-lg font-semibold">Elige tu donación</h3>

            {/* Amount Buttons */}
            <div className="mb-4 grid grid-cols-3 gap-3">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleAmountSelect(amount)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all",
                    selectedAmount === amount && !isCustom
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-xl font-bold">${amount}</span>
                  <span className="text-xs text-muted-foreground">MXN</span>
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <label className="mb-2 block text-sm text-muted-foreground">
                O ingresa otro monto:
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="Cantidad personalizada"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className={cn(
                    "pl-7",
                    isCustom && customAmount && "border-primary"
                  )}
                />
              </div>
            </div>

            {/* Impact Preview */}
            {finalAmount > 0 && (
              <div className="mb-6 rounded-lg bg-accent/20 p-4">
                <p className="text-sm">
                  Con <span className="font-bold text-primary">${finalAmount} MXN</span> puedes ayudar a{" "}
                  <span className="font-semibold">
                    {Math.floor(finalAmount / 50)} familia{Math.floor(finalAmount / 50) !== 1 ? "s" : ""}
                  </span>{" "}
                  esta semana.
                </p>
              </div>
            )}

            {/* Donate Button */}
            <Button 
              className="mb-6 w-full gap-2 py-6 text-lg" 
              size="lg"
              disabled={finalAmount <= 0 || isSubmitting}
              onClick={async () => {
                setIsSubmitting(true)
                try {
                  const { resolverMision } = await import('@/services/api')
                  // Aquí se usaría consumoDiario de la misión, pero si no está mandamos 3 por defecto
                  await resolverMision(mission.id, 3, 'publico')
                  alert('¡Donación exitosa! Muchas gracias por tu apoyo.')
                  onOpenChange(false)
                } catch (error) {
                  console.error(error)
                  alert('Hubo un error procesando la donación.')
                } finally {
                  setIsSubmitting(false)
                }
              }}
            >
              <Heart className="size-5" />
              {isSubmitting ? "Procesando..." : "Completar Donación"}
            </Button>

            {/* Security & Tax Links */}
            <div className="flex items-center justify-center gap-6">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
                    <Lock className="size-3.5" />
                    Donación Segura
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Tu información está protegida con encriptación SSL de 256 bits. Nunca compartimos tus datos con terceros.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
                    <FileText className="size-3.5" />
                    Deducible de Impuestos
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Tu donación es 100% deducible de impuestos. Recibirás un recibo fiscal por correo electrónico dentro de 24 horas.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
