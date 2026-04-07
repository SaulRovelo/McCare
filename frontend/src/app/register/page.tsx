"use client"

import { useState } from "react";
import Link from "next/link";
import { Heart, Eye, EyeOff, Lock } from "lucide-react";
import { Navigation } from "@/components/Navigation"
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

type AccountType = "individual" | "corporate";

export default function RegistroPage() {
    const [accountType, setAccountType] = useState<AccountType>("individual");
    const [showPassword, setShowPassword] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const router = useRouter();

    // ── Lógica de Registro con Google ──────────────────────────────────────
    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const response = await fetch("http://localhost:8000/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("userMcCare", JSON.stringify(data.usuario));
                // Redirección exitosa
                router.push('/dashboard');
            }
        } catch (error) {
            console.error("Error al registrarse con Google:", error);
        }
    };

    return (
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
                            type="button"
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
                            type="button"
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-slate-700" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                    Nombre(s)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Juan"
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 transition-colors focus:border-[#DA291C] focus:outline-none focus:ring-2 focus:ring-[#DA291C]/20"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-slate-700" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                    Apellidos
                                </label>
                                <input
                                    type="text"
                                    placeholder="Pérez López"
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 transition-colors focus:border-[#DA291C] focus:outline-none focus:ring-2 focus:ring-[#DA291C]/20"
                                />
                            </div>
                        </div>

                        {accountType === "corporate" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-slate-700" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                        Nombre de la Empresa
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Mi Empresa S.A."
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-[#DA291C] focus:outline-none focus:ring-2 focus:ring-[#DA291C]/20"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-slate-700" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                        RFC
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="XAXX010101000"
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-[#DA291C] focus:outline-none focus:ring-2 focus:ring-[#DA291C]/20"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-slate-700" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                placeholder="juan@ejemplo.com"
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-[#DA291C] focus:outline-none focus:ring-2 focus:ring-[#DA291C]/20"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-slate-700" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Mínimo 8 caracteres"
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 pr-10 text-slate-900 focus:border-[#DA291C] focus:outline-none focus:ring-2 focus:ring-[#DA291C]/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

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

                    {/* BOTÓN REAL DE GOOGLE */}
                    <div className="flex justify-center w-full">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => console.log('Error en Google Auth')}
                            useOneTap={false}
                            theme="outline"
                            width="350"
                            text="signup_with"
                            shape="pill"
                        />
                    </div>

                    {/* Footer conectado al login */}
                    <p className="mt-6 text-center text-slate-500" style={{ fontSize: "0.875rem" }}>
                        ¿Ya tienes una cuenta?{" "}
                        <Link href="/login" className="text-[#DA291C] underline hover:text-[#b8221a]" style={{ fontWeight: 500 }}>
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
            <p className="mt-4 text-center text-slate-400 text-[10px] flex items-center justify-center gap-1 mb-8">
                <Lock className="h-3 w-3" /> Acceso seguro mediante CareAuth SSL
            </p>
        </>
    );
}