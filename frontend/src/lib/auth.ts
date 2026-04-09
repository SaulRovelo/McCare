/**
 * src/lib/auth.ts — Gestión de sesión en el cliente
 *
 * Usa localStorage para MVP.
 * Para migrar a Supabase: reemplazar las funciones get/set/clear por
 * supabase.auth.getSession() sin tocar ningún otro archivo.
 */

const TOKEN_KEY = "mccare_token"
const USER_KEY  = "mccare_user"

// ── Tipos ──────────────────────────────────────────────────────────────────

export interface SessionUser {
  usuario_id: string
  nombre: string
  rol: "admin" | "donante" | "corporativo"
  access_token: string
  sede?: string
}

// ── Guardar sesión ─────────────────────────────────────────────────────────

export function setSession(data: SessionUser): void {
  if (typeof window === "undefined") return
  localStorage.setItem(TOKEN_KEY, data.access_token)
  localStorage.setItem(USER_KEY, JSON.stringify({
    usuario_id: data.usuario_id,
    nombre: data.nombre,
    rol: data.rol,
    sede: data.sede,
  }))
}

// ── Leer token ─────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

// ── Leer usuario de sesión ─────────────────────────────────────────────────

export function getSessionUser(): Omit<SessionUser, "access_token"> | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// ── Verificar si hay sesión activa ─────────────────────────────────────────

export function isAuthenticated(): boolean {
  return !!getToken()
}

// ── Verificar rol específico ───────────────────────────────────────────────

export function hasRole(rol: SessionUser["rol"]): boolean {
  return getSessionUser()?.rol === rol
}

// ── Cerrar sesión ──────────────────────────────────────────────────────────

export function clearSession(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// ── Redirect post-login según rol ──────────────────────────────────────────

export function getDashboardByRol(rol: string): string {
  switch (rol) {
    case "admin":       return "/dashboard"
    case "corporativo": return "/corporativo"
    case "donante":
    default:            return "/donante"
  }
}
