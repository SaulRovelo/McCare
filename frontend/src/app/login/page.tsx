import { Heart, Briefcase, Shield, ArrowRight, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"

const roles = [
  {
    id: "donante",
    title: "Donante Individual",
    description:
      "Accede a tu historial de donaciones, recibos fiscales y ve el impacto directo de tu generosidad en las familias.",
    icon: Heart,
    color: "bg-primary/10 text-primary",
    borderColor: "hover:border-primary/50",
    href: "/impacto",
  },
  {
    id: "corporativo",
    title: "Socio Corporativo",
    description:
      "Portal empresarial con reportes ESG, documentos de deducibilidad fiscal y métricas de impacto para stakeholders.",
    icon: Briefcase,
    color: "bg-amber-500/10 text-amber-500",
    borderColor: "hover:border-amber-500",
    href: "/corporativo",
  },
  {
    id: "admin",
    title: "Administración McCare",
    description:
      "Panel interno para gestión de inventario, familias, voluntarios y análisis predictivo CareForecast.",
    icon: Shield,
    color: "bg-slate-500/10 text-slate-500",
    borderColor: "hover:border-slate-500/50",
    href: "/dashboard",
  },
]

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 bg-slate-50">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">Portal de Acceso Seguro</Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Bienvenido a McCare</h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Selecciona tu tipo de cuenta para acceder al portal correspondiente
          </p>
        </div>

        <div className="grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((rol) => (
            <Card
              key={rol.id}
              className={cn(
                "group relative cursor-pointer border-2 transition-all duration-200 hover:shadow-lg bg-white",
                rol.borderColor
              )}
            >
              <CardHeader className="pb-4">
                <div className={cn("mb-3 flex h-12 w-12 items-center justify-center rounded-xl", rol.color)}>
                  <rol.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{rol.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{rol.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <Button
                  asChild
                  className="w-full gap-2 group-hover:gap-3 transition-all bg-[#DB0007] hover:bg-red-800 text-white"
                >
                  <Link href={rol.href}>
                    Acceder
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
              <CardFooter className="justify-center border-t pt-4">
                <button className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4 transition-colors">
                  Crear cuenta nueva
                </button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
          <Lock className="h-3.5 w-3.5" /> Conexión segura con encriptación SSL de 256 bits
        </p>
      </main>
      <Footer />
    </div>
  )
}
