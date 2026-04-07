"use client"

import { useState } from "react";
import Link from "next/link";
import { Heart, Eye, EyeOff } from "lucide-react";
import { Navigation } from "@/components/Navigation"

type AccountType = "individual" | "corporate";

export default function RegistroPage() {
    const [accountType, setAccountType] = useState<AccountType>("individual");
    const [showPassword, setShowPassword] = useState(false);
    const [accepted, setAccepted] = useState(false);

    return (
        // 2. Envolvemos todo en un Fragmento <> para poder poner el Navigation arriba
        <>
            <Navigation />

            <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">

                    {/* Header */}
                    <div className="mb-8 flex flex-col items-center">
                        <div className="mb-4 flex items-center gap-2">
                            <Heart className="h-6 w-6 fill-[#DA291C] text-[#DA291C]" />
                            <span className="tracking-tight text-slate-900" style={{ fontSize: "1.125rem", fontWeight: 600 }}>
                                McCare
                            </span>
                        </div>
                        <h1 className="mb-1 text-slate-900" style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                            Únete a McCare
                        </h1>
                        <p className="text-slate-500" style={{ fontSize: "0.875rem" }}>
                            Crea tu cuenta para comenzar a generar impacto
                        </p>
                    </div>

                    {/* Account Type Tabs */}
                    <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
                        <button
                            onClick={() => setAccountType("individual")}
                            className={`flex-1 cursor-pointer rounded-md px-4 py-2 transition-all ${accountType === "individual"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                            style={{ fontSize: "0.875rem", fontWeight: 500 }}
                        >
                            Donante Individual
                        </button>
                        <button
                            onClick={() => setAccountType("corporate")}
                            className={`flex-1 cursor-pointer rounded-md px-4 py-2 transition-all ${accountType === "corporate"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                            style={{ fontSize: "0.875rem", fontWeight: 500 }}
                        >
                            Socio Corporativo
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">

                        {/* Row 1: Name fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-slate-700" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                    Nombre(s)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Juan"
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-[#DA291C] focus:outline-none focus:ring-2 focus:ring-[#DA291C]/20"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-slate-700" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                    Apellidos
                                </label>
                                <input
                                    type="text"
                                    placeholder="Pérez López"
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-[#DA291C] focus:outline-none focus:ring-2 focus:ring-[#DA291C]/20"
                                />
                            </div>
                        </div>

                        {/* Row 2: Corporate fields */}
                        {accountType === "corporate" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-slate-700" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                        Nombre de la Empresa
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Mi Empresa S.A."
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-[#DA291C] focus:outline-none focus:ring-2 focus:ring-[#DA291C]/20"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-slate-700" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                        RFC
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="XAXX010101000"
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-[#DA291C] focus:outline-none focus:ring-2 focus:ring-[#DA291C]/20"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="mb-1.5 block text-slate-700" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                placeholder="juan@ejemplo.com"
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-[#DA291C] focus:outline-none focus:ring-2 focus:ring-[#DA291C]/20"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-1.5 block text-slate-700" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Mínimo 8 caracteres"
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 pr-10 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-[#DA291C] focus:outline-none focus:ring-2 focus:ring-[#DA291C]/20"
                                />
                                {/* EL ERROR ESTABA AQUÍ: El botón terminaba en /> en lugar de > */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                                className="mt-0.5 h-4 w-4 cursor-pointer rounded accent-[#DA291C]"
                            />
                            <label htmlFor="terms" className="cursor-pointer text-slate-500" style={{ fontSize: "0.8125rem", fontWeight: 400 }}>
                                Acepto los{" "}
                                <a href="#" className="text-[#DA291C] underline hover:text-[#b8221a]">
                                    términos y condiciones
                                </a>{" "}
                                y el{" "}
                                <a href="#" className="text-[#DA291C] underline hover:text-[#b8221a]">
                                    aviso de privacidad
                                </a>
                            </label>
                        </div>

                        {/* CTA */}
                        <button
                            type="submit"
                            className="mt-2 w-full cursor-pointer rounded-lg bg-[#DA291C] py-3 text-white transition-colors hover:bg-[#b8221a]"
                            style={{ fontWeight: 500 }}
                        >
                            Crear cuenta
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-5 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-slate-400" style={{ fontSize: "0.8125rem" }}>O regístrate con</span>
                        <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    {/* Google Button */}
                    <button className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 transition-colors hover:bg-slate-50">
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="text-slate-700" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                            Continuar con Google
                        </span>
                    </button>

                    {/* Footer conectado al login */}
                    <p className="mt-6 text-center text-slate-500" style={{ fontSize: "0.875rem" }}>
                        ¿Ya tienes una cuenta?{" "}
                        <Link href="/login" className="text-[#DA291C] underline hover:text-[#b8221a]" style={{ fontWeight: 500 }}>
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}