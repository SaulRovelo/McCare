/**
 * Capa de servicios para consumo de endpoints del Donante Individual (B2C)
 */

import { fetchJSON } from './api' // Se usa la función de api.ts que resuelve el JWT

export const getPerfilDonante = (usuarioId: string) => 
  fetchJSON(`/api/donantes/${usuarioId}/perfil`)

export const getHistorialDonaciones = (usuarioId: string, limit = 5) => 
  fetchJSON(`/api/donantes/${usuarioId}/historial?limit=${limit}`)

// Esta función es un wrapper sobre los insumos regulares si se deseaba separarla, o apunta a la general.
export const getMisionesActivas = (sede?: string) => 
  fetchJSON(`/api/misiones${sede ? `?sede=${sede}` : ''}`)

export const getRecibosDonante = (usuarioId: string) => 
  fetchJSON(`/api/donantes/${usuarioId}/recibos`)

// ── CONFIGURACIÓN DE CUENTA ───────────────────────────────────────────────────

export const getPerfilUsuario = (usuarioId: string) =>
  fetchJSON(`/api/donantes/${usuarioId}/cuenta`)

export const updatePerfilUsuario = (usuarioId: string, data: any) =>
  fetchJSON(`/api/donantes/${usuarioId}/cuenta`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

/**
 * Actualiza la contraseña en la tabla usuarios.
 * En el backend, el endpoint debe encriptar `nuevaContrasena` (ej. con bcrypt o Argon2)
 * antes de almacenarla en la columna `password_hash`.
 */
export const updatePassword = (usuarioId: string, nuevaContrasena: string) =>
  fetchJSON(`/api/donantes/${usuarioId}/cuenta/password`, {
    method: 'PATCH',
    body: JSON.stringify({ password: nuevaContrasena }),
  })
