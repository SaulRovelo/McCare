"use client"

import { useState } from "react"
import { Heart, CheckCircle2, CreditCard, Calendar, Lock, Package, Truck, MapPin, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

// Importa tus componentes de layout (Ajusta la ruta si es necesario)
import { Navigation } from "@/components/Navigation" 

export default function DonarPage() {
  const router = useRouter()
  const [isMonthly, setIsMonthly] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(500)
  const [customAmount, setCustomAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [selectedHouse, setSelectedHouse] = useState("")
  const [objectData, setObjectData] = useState({ name: "", weight: "", cp: "" })
  const [shippingOptions, setShippingOptions] = useState<any[]>([])
  const [selectedRate, setSelectedRate] = useState<any>(null)
  const [isLoadingShipping, setIsLoadingShipping] = useState(false)

  const presetAmounts = [200, 500, 1000, 2500, 5000]
  const houses = [
    { id: "cdmx", name: "Casa Tlalpan (CDMX)", cp: "14000" },
    { id: "puebla", name: "Casa Puebla", cp: "72190" },
    { id: "toluca", name: "Casa Toluca (Edo. Méx)", cp: "50000" }
  ]

  const currentAmount = customAmount ? parseInt(customAmount) || 0 : selectedAmount || 0

  const handleCalculateShipping = async () => {
    const destination = houses.find(h => h.id === selectedHouse);
    if (!objectData.cp || !objectData.weight || !destination) return alert("Faltan datos de envío");
    setIsLoadingShipping(true);
    try {
      const { postCotizarEnvio } = await import('@/services/api');
      const data = await postCotizarEnvio({
        cp_origen: objectData.cp,
        cp_destino: destination.cp,
        weight: parseFloat(objectData.weight)
      });
      setShippingOptions(Array.isArray(data) ? data : []);
    } catch (e) { alert("Error en el servidor de envíos"); }
    finally { setIsLoadingShipping(false); }
  }

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const finalData = {
      monto: selectedRate ? selectedRate.total_pricing : currentAmount,
      tipo: selectedRate ? "objeto" : "dinero",
      casa: selectedHouse,
      item: objectData.name || "Donación General"
    };
    localStorage.setItem("mccare_checkout", JSON.stringify(finalData));
    router.push("/checkout");
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* MANTIENE TU BARRA DE ARRIBA */}
      <Navigation />

      {/* CONTENIDO CENTRAL */}
      <main className="flex-grow bg-muted/30 py-12 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <Badge variant="secondary" className="mb-3">Donación General</Badge>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Apoya el Fondo General McCare</h1>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Lado Izquierdo: Info */}
            <Card className="h-fit border-2 shadow-lg border-none">
              <CardHeader className="border-b bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Impacto en tiempo real</CardTitle>
                    <CardDescription>Tu ayuda llega directo a la sede</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 font-semibold">
                    <MapPin className="h-4 w-4 text-primary" /> Sede McCare
                  </Label>
                  <Select onValueChange={setSelectedHouse}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder="Selecciona una sede" /></SelectTrigger>
                    <SelectContent>
                      {houses.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800">Tu donación cubre:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {["Comidas para familias", "Higiene personal", "Transporte al hospital"].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Lado Derecho: Formulario */}
            <Card className="border-2 shadow-lg overflow-hidden border-none">
              <Tabs defaultValue="money" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-14 bg-slate-100 rounded-none">
                  <TabsTrigger value="money" className="gap-2"><CreditCard className="h-4 w-4" /> Dinero</TabsTrigger>
                  <TabsTrigger value="object" className="gap-2"><Package className="h-4 w-4" /> Objeto</TabsTrigger>
                </TabsList>

                <TabsContent value="money" className="p-6 space-y-6">
                  <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label className="font-medium">{isMonthly ? "Mensual" : "Única"}</Label>
                        <p className="text-xs text-muted-foreground">Suscripción de apoyo</p>
                      </div>
                    </div>
                    <Switch checked={isMonthly} onCheckedChange={setIsMonthly} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {presetAmounts.map((amount) => (
                      <Button key={amount} variant={selectedAmount === amount ? "default" : "outline"}
                        className={selectedAmount === amount ? "bg-[#DA291C] hover:bg-red-800" : ""}
                        onClick={() => { setSelectedAmount(amount); setCustomAmount("") }}
                      >${amount}</Button>
                    ))}
                  </div>
                  <Input placeholder="Monto personalizado" type="number" value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null) }} />
                </TabsContent>

                <TabsContent value="object" className="p-6 space-y-4">
                  <Input placeholder="¿Qué vas a donar?" onChange={(e) => setObjectData({...objectData, name: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="CP Origen" onChange={(e) => setObjectData({...objectData, cp: e.target.value})} />
                    <Input placeholder="Peso (kg)" type="number" onChange={(e) => setObjectData({...objectData, weight: e.target.value})} />
                  </div>
                  <Button variant="outline" className="w-full border-primary text-primary" onClick={handleCalculateShipping} disabled={isLoadingShipping}>
                    {isLoadingShipping ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Truck className="h-4 w-4 mr-2" />} Cotizar Envío Skydropx
                  </Button>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {Array.isArray(shippingOptions) && shippingOptions.map((rate) => (
                      <div key={rate.id} onClick={() => setSelectedRate(rate)}
                        className={`p-3 border rounded-xl cursor-pointer flex justify-between items-center transition-all ${selectedRate?.id === rate.id ? "border-[#DA291C] bg-red-50" : "bg-white"}`}
                      >
                        <span className="text-xs font-bold uppercase">{rate.provider}</span>
                        <span className="font-bold text-[#DA291C]">${rate.total_pricing}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <CardFooter className="flex-col gap-4 border-t bg-muted/30 pt-6">
                <Button size="lg" className="h-14 w-full bg-[#DA291C] hover:bg-red-800 text-white text-lg font-bold shadow-lg"
                  disabled={(!selectedRate && currentAmount <= 0) || !selectedHouse} onClick={handleFinalSubmit}
                >
                  <Heart className="h-5 w-5 mr-2" />
                  {selectedRate ? `Pagar Envío $${selectedRate.total_pricing}` : `Donar $${currentAmount.toLocaleString()}`}
                </Button>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                  <Lock className="h-3 w-3" /> Transacción encriptada McCare
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      {/* MANTIENE TU FOOTER ABAJO */}
      <footer className="bg-white border-t py-12">
        <div className="mx-auto max-w-7xl px-4 text-center">
            {/* Aquí va el contenido de tu footer que sale en la imagen */}
            <p className="text-sm text-muted-foreground">© 2026 McCare. Un proyecto apoyando la Casa Ronald McDonald.</p>
        </div>
      </footer>
    </div>
  )
}