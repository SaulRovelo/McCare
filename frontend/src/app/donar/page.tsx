"use client"

import { useState } from "react"
import { Heart, CheckCircle2, CreditCard, Calendar, Lock } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  generateDonationCertificate,
  getLoggedUserName,
} from "@/lib/generateDonationCertificate";

export default function DonarPage() {
  const [isMonthly, setIsMonthly] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(500)
  const [customAmount, setCustomAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const presetAmounts = [200, 500, 1000, 2500, 5000]

  const currentAmount = customAmount
    ? parseInt(customAmount) || 0
    : selectedAmount || 0

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <Badge variant="secondary" className="mb-3">
            Donación General
          </Badge>
          <h1 className="text-3xl font-bold">Apoya el Fondo General McCare</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Summary Card */}
          <Card className="h-fit border-2 shadow-lg">
            <CardHeader className="border-b bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Fondo General</CardTitle>
                  <CardDescription>Necesidades urgentes e imprevistas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <p className="leading-relaxed text-muted-foreground">
                El Fondo General de McCare se utiliza para cubrir las necesidades
                más urgentes e imprevistas de las Casas Ronald McDonald. Desde
                reparaciones de emergencia hasta suministros médicos de última hora,
                tu donación nos da la flexibilidad de actuar cuando las familias
                más lo necesitan.
              </p>

              <div className="space-y-3">
                <h3 className="font-semibold">Tu donación puede cubrir:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    "Comidas calientes para familias que acaban de llegar",
                    "Suministros de higiene y cuidado personal",
                    "Transporte de emergencia al hospital",
                    "Mantenimiento urgente de las instalaciones",
                    "Apoyo psicológico para familias en crisis",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg bg-accent/20 p-4">
                <p className="text-sm font-medium">
                  <span className="text-primary">100%</span> de tu donación va
                  directamente a apoyar a las familias. McCare opera con donaciones
                  corporativas separadas para gastos administrativos.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Right: Donation Form */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Información de Donación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Monthly Toggle */}
              <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="monthly-toggle" className="font-medium">
                      {isMonthly ? "Suscripción Mensual" : "Donación Única"}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isMonthly
                        ? "Se cobrará cada mes"
                        : "Pago único, sin compromiso"}
                    </p>
                  </div>
                </div>
                <Switch
                  id="monthly-toggle"
                  checked={isMonthly}
                  onCheckedChange={setIsMonthly}
                />
              </div>

              {/* Preset Amounts */}
              <div className="space-y-3">
                <Label>Selecciona un monto</Label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {presetAmounts.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant={
                        selectedAmount === amount && !customAmount
                          ? "default"
                          : "outline"
                      }
                      className="h-12"
                      onClick={() => {
                        setSelectedAmount(amount)
                        setCustomAmount("")
                      }}
                    >
                      ${amount.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="space-y-2">
                <Label htmlFor="custom-amount">O ingresa otro monto</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="Otro monto"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setSelectedAmount(null)
                    }}
                    className="pl-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    MXN
                  </span>
                </div>
              </div>

              {/* Donor Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="donor-name">Nombre completo</Label>
                  <Input id="donor-name" placeholder="Tu nombre" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="donor-email">Correo electrónico</Label>
                  <Input
                    id="donor-email"
                    type="email"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Impact Preview */}
              {currentAmount > 0 && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm font-medium text-primary">
                    Con ${currentAmount.toLocaleString()} MXN
                    {isMonthly ? " al mes" : ""} puedes:
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {currentAmount >= 5000
                      ? "Cubrir las necesidades de una familia por una semana completa"
                      : currentAmount >= 2500
                        ? "Proporcionar 50 comidas calientes para familias"
                        : currentAmount >= 1000
                          ? "Abastecer suministros de higiene para 10 familias"
                          : currentAmount >= 500
                            ? "Ofrecer 5 noches de hospedaje a una familia"
                            : "Proporcionar artículos esenciales de primera necesidad"}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-4 border-t bg-muted/30 pt-6">
              <Button
                size="lg"
                className="h-14 w-full gap-2 text-lg font-semibold shadow-lg bg-mccare-red hover:bg-red-800 text-white"
                disabled={currentAmount <= 0 || isSubmitting}
                onClick={async () => {
                  try {
                    setIsSubmitting(true)

                    const { postDonacionGeneral } = await import("@/services/api")

                    await postDonacionGeneral(currentAmount)

                    const donorNameInput = (
                        document.getElementById("donor-name") as HTMLInputElement | null
                    )?.value?.trim()

                    generateDonationCertificate({
                      donorName: donorNameInput || getLoggedUserName(),
                      donationType: "monto",
                      amount: currentAmount,
                      createdAt: new Date(),
                    })

                    alert("¡Donación general exitosa! Se descargó tu certificado.")

                    setSelectedAmount(500)
                    setCustomAmount("")
                  } catch (e) {
                    console.error(e)
                    alert("Error procesando tu donación. Intenta más tarde.")
                  } finally {
                    setIsSubmitting(false)
                  }
                }}
              >
                <Heart className="h-5 w-5" />
                {isSubmitting ? "Procesando..." : "Completar Donación"}
                {!isSubmitting && currentAmount > 0 && (
                  <span className="ml-1">
                    · ${currentAmount.toLocaleString()} MXN
                  </span>
                )}
              </Button>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Pago seguro SSL
                </span>
                <span>•</span>
                <span>Recibo fiscal inmediato</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}