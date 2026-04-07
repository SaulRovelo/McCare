import Link from "next/link"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Marca */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
                <Heart className="size-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">McCare</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Apoyando a familias con niños críticamente enfermos a través de
              la Casa de la Amistad Ronald McDonald.
            </p>
          </div>

          {/* Enlaces */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#misiones" className="hover:text-foreground">Misiones Críticas</Link></li>
              <li><Link href="#nosotros" className="hover:text-foreground">Nosotros</Link></li>
              <li><Link href="/impacto" className="hover:text-foreground">Nuestro Impacto</Link></li>
              <li><Link href="#" className="hover:text-foreground">Voluntariado</Link></li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Soporte</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Contáctanos</Link></li>
              <li><Link href="#" className="hover:text-foreground">Preguntas Frecuentes</Link></li>
              <li><Link href="#" className="hover:text-foreground">Recibos de Donación</Link></li>
              <li><Link href="#" className="hover:text-foreground">Alianzas Corporativas</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Política de Privacidad</Link></li>
              <li><Link href="#" className="hover:text-foreground">Términos de Servicio</Link></li>
              <li><Link href="#" className="hover:text-foreground">Política de Cookies</Link></li>
              <li><Link href="#" className="hover:text-foreground">Accesibilidad</Link></li>
            </ul>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} McCare. Un proyecto apoyando la Casa Ronald McDonald.
          </p>
          <p className="text-sm text-muted-foreground">
            Hecho con <Heart className="inline-block size-4 text-primary" /> para familias que lo necesitan.
          </p>
        </div>
      </div>
    </footer>
  )
}
