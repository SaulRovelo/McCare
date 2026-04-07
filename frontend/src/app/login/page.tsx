"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Eye, EyeOff, Lock } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    // ── Lógica de Integración con Backend ──────────────────────────────────
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
                router.push('/dashboard');
            }
        } catch (error) {
            console.error("Error en el inicio de sesión con Google:", error);
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
                            Bienvenido de nuevo
                        </h1>
                        <p className="text-slate-500" style={{ fontSize: "0.875rem" }}>
                            Ingresa tus credenciales para acceder a tu portal
                        </p>
                    </div>

                    {/* Formulario de Login Tradicional */}
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                        <div>
                            <label className="mb-1.5 block text-slate-700" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                placeholder="tu@correo.com"
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-[#DA291C] focus:outline-none focus:ring-2 focus:ring-[#DA291C]/20"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-slate-700" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                    Contraseña
                                </label>
                                <a href="#" className="text-[#DA291C] hover:underline" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
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

                        <button
                            type="submit"
                            className="mt-2 w-full cursor-pointer rounded-lg bg-[#DA291C] py-3 text-white transition-colors hover:bg-[#b8221a] font-medium"
                        >
                            Iniciar sesión
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-slate-400 uppercase tracking-widest" style={{ fontSize: "0.7rem", fontWeight: 600 }}>O entra con</span>
                        <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    <div className="flex justify-center w-full overflow-hidden">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => console.log('Error en Login Google')}
                            useOneTap={false}
                            theme="outline"
                            width="350"
                            text="signin_with"
                            shape="pill"
                        />
                    </div>

                    {/* ESTE ES EL ENLACE QUE CONECTA CON REGISTRO */}
                    <p className="mt-8 text-center text-slate-500" style={{ fontSize: "0.875rem" }}>
                        ¿Aún no tienes cuenta?{" "}
                        <Link 
                            href="/register" 
                            className="text-[#DA291C] underline hover:text-[#b8221a] font-semibold"
                        >
                            Regístrate ahora
                        </Link>
                    </p>
                </div>
            </div>

            <p className="mt-4 text-center text-slate-400 text-[10px] flex items-center justify-center gap-1 mb-8 uppercase tracking-tighter">
                <Lock className="h-3 w-3" /> Acceso encriptado McCare Network v12.0
            </p>
        </>
    );
}