/**
 * frontend/src/services/api.ts — Capa de servicios HTTP del frontend
 *
 * Responsabilidad: centralizar todas las llamadas al backend.
 * El frontend nunca calcula reglas de negocio — solo consume JSON del API.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/** Fetch con inyección automática del JWT si existe sesión activa */
const fetchJSON = async (url: string, options?: RequestInit) => {
  // Importación dinámica para evitar errores en SSR
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('mccare_token');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${url}`, {
    cache: 'no-store',
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.detail ?? `Error ${res.status} en ${url}`);
  }
  return res.json();
};

// ── Inventario ────────────────────────────────────────────────────────────────

export const getInsumos = (sede?: string) => fetchJSON(`/api/insumos${sede ? `?sede=${sede}` : ''}`);

export const postInsumo = (data: object) =>
  fetchJSON('/api/insumos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

// ── Misiones ──────────────────────────────────────────────────────────────────

export const getMisiones = () => fetchJSON('/api/misiones');

// ── Auditoría / Movimientos ───────────────────────────────────────────────────

export const getMovimientosGlobales = (limit = 20, sede?: string) =>
  fetchJSON(`/api/movimientos?limit=${limit}${sede ? `&sede=${sede}` : ''}`);

export const getMovimientosPorInsumo = (insumoId: string) =>
  fetchJSON(`/api/insumos/${insumoId}/movimientos`);

/**
 * Registra un movimiento real. Incluye campo 'origen' para trazabilidad.
 * origen: 'interno' | 'publico' | 'corporativo'
 */
export const postMovimiento = (data: {
  insumo_id: string;
  tipo_movimiento: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  observacion?: string;
  origen?: 'interno' | 'publico' | 'corporativo';
}) =>
  fetchJSON('/api/movimientos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origen: 'interno', ...data }),
  });

// ── Analítica ──────────────────────────────────────────────────────────────────

export const getForecast = (limit = 20, sede?: string) =>
  fetchJSON(`/api/forecast?limit=${limit}${sede ? `&sede=${sede}` : ''}`);

// ── Admin ──────────────────────────────────────────────────────────────────────

export const getAdminResumen = (sede?: string) => fetchJSON(`/api/admin/resumen${sede ? `?sede=${sede}` : ''}`);

// ── B2C Público ───────────────────────────────────────────────────────────────

export const getImpactStories = (limit = 15) =>
  fetchJSON(`/api/impacto/historias?limit=${limit}`);

export const getImpactoResumen = () => fetchJSON('/api/impacto/resumen');

export const postDonacionGeneral = (monto: number) =>
  fetchJSON(`/api/impacto/donar_general?monto=${monto}`, {
    method: 'POST',
  });

/**
 * Resuelve una misión registrando una entrada de reabastecimiento.
 * Origen configurable para distinguir acción pública vs. corporativa vs. interna.
 */
export const resolverMision = (
  insumoId: string,
  consumoDiario: number,
  origen: 'interno' | 'publico' | 'corporativo' = 'interno'
) =>
  postMovimiento({
    insumo_id: insumoId,
    tipo_movimiento: 'entrada',
    cantidad: Math.max(Math.round(consumoDiario * 14), 20),
    observacion: `Reabastecimiento — acción ${origen}`,
    origen,
  });

// ── Corporativo ───────────────────────────────────────────────────────────────

export const getCorporativoResumen = (periodo = 30) =>
  fetchJSON(`/api/corporativo/resumen?periodo=${periodo}`);

export const getMisionesFinanciables = () =>
  fetchJSON('/api/corporativo/misiones-financiables');

export const getReporteCorporativo = (periodo = 30) =>
  fetchJSON(`/api/corporativo/reporte?periodo=${periodo}`);

/**
 * Patrocina una misión con trazabilidad corporativa.
 * El campo origen='corporativo' queda registrado en el movimiento.
 */
export const patrocinarMision = (insumoId: string, consumoEstimado: number) =>
  resolverMision(insumoId, consumoEstimado, 'corporativo');

// ── Compatibilidad con código anterior ────────────────────────────────────────

// Mantener para no romper referencias existentes en /impacto/page.tsx
export const resolverMisionPost = async (insumoCompleto: any) =>
  resolverMision(insumoCompleto.id, insumoCompleto.consumo_diario, 'publico');

export const simularEscenarioCritico = async () =>
  postInsumo({
    nombre: 'Fórmula Láctea Etapa 1',
    categoria: 'Alimentos',
    stock_actual: 1,
    consumo_diario: 3,
    nivel_critico: 10,
  });

// ── Autenticación ─────────────────────────────────────────────────────────────

export interface LoginPayload { email: string; password: string }
export interface RegistroPayload {
  nombre: string;
  email: string;
  password: string;
  rol?: "donante" | "corporativo" | "admin";
  sede?: string;
  empresa_nombre?: string;
  empresa_rfc?: string;
}

export const loginUsuario = (data: LoginPayload) =>
  fetchJSON('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const registrarUsuario = (data: RegistroPayload) =>
  fetchJSON('/api/auth/registro', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getMiPerfil = () => fetchJSON('/api/auth/me');

export const actualizarMiPerfil = (data: object) =>
  fetchJSON('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const logoutUsuario = () =>
  fetchJSON('/api/auth/logout', { method: 'POST' });

// ── Notificaciones ─────────────────────────────────────────────────────────────

export const getNotificaciones = (soloNoLeidas = false, limit = 20) =>
  fetchJSON(`/api/notificaciones?solo_no_leidas=${soloNoLeidas}&limit=${limit}`);

export const getNotificacionesCount = (): Promise<{ no_leidas: number }> =>
  fetchJSON('/api/notificaciones/count');

export const marcarNotificacionLeida = (id: string) =>
  fetchJSON(`/api/notificaciones/${id}/leer`, { method: 'PATCH' });

export const marcarTodasLeidas = () =>
  fetchJSON('/api/notificaciones/leer-todas', { method: 'POST' });

// ── Configuración ─────────────────────────────────────────────────────────────

export const getConfiguracion = () => fetchJSON('/api/configuracion');

export const actualizarConfiguracion = (clave: string, valor: string) =>
  fetchJSON(`/api/configuracion/${clave}?valor=${encodeURIComponent(valor)}`, { method: 'PATCH' });

// ── Abastecimiento Urgente ─────────────────────────────────────────────────────

export const solicitarAbastecimientoUrgente = (insumoId: string) =>
  fetchJSON(`/api/misiones/urgente?insumo_id=${insumoId}`, { method: 'POST' });

// ── Familias ──────────────────────────────────────────────────────────────────

export interface FamiliaPayload {
  sede: string;
  numero_adultos: number;
  numero_ninos: number;
  dias_estancia_est: number;
  habitacion?: string;
  paciente_edad?: number;
  paciente_referencia?: string;
  necesidades_especiales?: string;
}

export const getFamilias = (sede?: string, estado: string = "activa") =>
  fetchJSON(`/api/familias?estado=${estado}${sede ? `&sede=${sede}` : ''}`);

export const registrarFamilia = (data: FamiliaPayload) =>
  fetchJSON('/api/familias', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const darAltaFamilia = (id: string) =>
  fetchJSON(`/api/familias/${id}/dar-alta`, { method: 'PATCH' });

export const darProrrogaFamilia = (id: string) =>
  fetchJSON(`/api/familias/${id}/prorroga`, { method: 'PATCH' });

export const getFamiliasStats = (sede?: string) =>
  fetchJSON(`/api/familias/stats${sede ? `?sede=${sede}` : ''}`);

