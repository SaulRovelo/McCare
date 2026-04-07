"use client"

import * as React from "react"
import Link from "next/link"
import { Heart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
            <Heart className="size-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            McCare
          </span>
        </Link>

        {/* Navegación de escritorio */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/#misiones"
                  className={cn(
                    "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  )}
                >
                  Misiones Críticas
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/#nosotros"
                  className={cn(
                    "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  )}
                >
                  Nosotros
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/impacto"
                  className={cn(
                    "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  )}
                >
                  Nuestro Impacto
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* CTA escritorio */}
        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="ghost" className="text-foreground hover:bg-slate-100">
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild className="bg-[#DB0007] hover:bg-red-800 text-white gap-2">
            <Link href="/donar">
              <Heart className="size-4" />
              Donar Ahora
            </Link>
          </Button>
        </div>

        {/* Botón menú mobile */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Menú mobile */}
      {mobileMenuOpen && (
        <div className="border-t bg-background md:hidden">
          <div className="space-y-1 px-4 py-4">
            <Link href="/#misiones" className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
              Misiones Críticas
            </Link>
            <Link href="/#nosotros" className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
              Nosotros
            </Link>
            <Link href="/impacto" className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
              Nuestro Impacto
            </Link>
            <div className="flex flex-col gap-2 pt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Iniciar sesión</Link>
              </Button>
              <Button asChild className="w-full gap-2 bg-[#DB0007] hover:bg-red-800 text-white">
                <Link href="/donar" onClick={() => setMobileMenuOpen(false)}>
                  <Heart className="size-4" />
                  Donar Ahora
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
