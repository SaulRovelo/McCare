"use client"

import { useState } from "react"
import { Heart, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { loginUsuario } from "@/services/api"
import { setSession, getDashboardByRol } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]         = useState("")
  const [password, setPassword]   = useState("")
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError("Completa todos los campos."); return }
    setLoading(true)
    setError(null)
    try {
      const data = await loginUsuario({ email, password })
      setSession(data)
      router.push(getDashboardByRol(data.rol))
    } catch (err: any) {
      setError(err.message ?? "Error al iniciar sesión.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 bg-slate-50">

        <div className="w-full max-w-md">
          {/* Header simplificado */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex items-center gap-2">
              <Heart className="h-6 w-6 fill-[#DA291C] text-[#DA291C]" />
              <span className="text-xl font-semibold tracking-tight text-slate-900">
                McCare
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
            <p className="mt-2 text-sm text-slate-500">
              Accede a tu cuenta para continuar
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            
            {/* Error */}
            {error && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#DA291C] focus:outline-none focus:ring-2 focus:ring-[#DA291C]/20"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Tu contraseña"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-slate-900 placeholder:text-slate-400 focus:border-[#DA291C] focus:outline-none focus:ring-2 focus:ring-[#DA291C]/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#DA291C] hover:bg-[#b8221a] text-white py-3 rounded-xl gap-2 font-medium"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Verificando..." : "Iniciar sesión"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-slate-400 text-xs">O iniciar con</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Google Button */}
            <button 
              type="button" 
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-slate-700 text-sm font-medium">Google</span>
            </button>

            <p className="mt-6 text-center text-sm text-slate-500">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-[#DA291C] underline hover:text-[#b8221a] font-medium">
                Regístrate gratis
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" />
            Conexión segura con encriptación SSL de 256 bits
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
