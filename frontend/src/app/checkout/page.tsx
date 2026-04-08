"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/Navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Heart, ShieldCheck, CreditCard, Loader2 } from "lucide-react"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"

export default function CheckoutPage() {
    const [donationData, setDonationData] = useState<any>(null)

    useEffect(() => {
        const saved = localStorage.getItem("mccare_checkout")
        if (saved) setDonationData(JSON.parse(saved))
    }, [])

    if (!donationData) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navigation />
            <main className="flex-grow bg-muted/30 py-12 px-4">
                <div className="mx-auto max-w-xl">
                    <Card className="border-none shadow-2xl">
                        <CardHeader className="bg-slate-900 text-white rounded-t-xl text-center py-8">
                            <CardTitle className="text-2xl font-bold uppercase tracking-tight">Finalizar Donación</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            <div className="text-center">
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Monto a Transferir</p>
                                <h2 className="text-5xl font-black text-[#DA291C] tracking-tighter">${donationData.monto} <span className="text-lg">MXN</span></h2>
                            </div>
                            <div className="bg-slate-50 border rounded-2xl p-5 space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-slate-500">Destino:</span>
                                    <span className="text-slate-900 uppercase font-bold">{donationData.casa}</span>
                                </div>
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-slate-500">Causa:</span>
                                    <span className="text-slate-900">{donationData.tipo === 'objeto' ? 'Logística Solidaria' : 'Fondo General'}</span>
                                </div>
                            </div>
                            <div className="pt-2">
                                <PayPalScriptProvider options={{ "clientId": "test", "currency": "MXN" }}>
                                    <PayPalButtons 
                                        style={{ layout: "vertical", shape: "rect", color: "blue" }}
                                        createOrder={(data, actions) => {
                                            return actions.order.create({
                                                purchase_units: [{ amount: { value: donationData.monto.toString(), currency_code: "MXN" } }]
                                            });
                                        }}
                                        onApprove={async (data, actions) => {
                                            alert("¡Donación procesada con éxito!");
                                            window.location.href = "/";
                                        }}
                                    />
                                </PayPalScriptProvider>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-center border-t py-4 bg-slate-50">
                            <p className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase">
                                <ShieldCheck className="h-3 w-3 text-green-500" /> Transacción Cifrada McCare v12.0
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    )
}