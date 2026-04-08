/**
 * frontend/src/services/api.ts — Capa de servicios HTTP del frontend
 *
 * Responsabilidad: centralizar todas las llamadas al backend.
 * El frontend nunca calcula reglas de negocio — solo consume JSON del API.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const fetchJSON = async (url: string, options?: RequestInit) => {
  const res = await fetch(`${API_URL}${url}`, { 
    cache: 'no-store', 
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    }
  });
  if (!res.ok) throw new Error(`Error ${res.status} en ${url}`);
  return res.json();
};

// ── Logística (Skydropx) ──────────────────────────────────────────────────────

/**
 * Cotiza un envío real basándose en CP origen, destino y peso.
 */
export const postCotizarEnvio = (data: { cp_origen: string, cp_destino: string, peso: number }) =>
  fetchJSON('/api/envios/cotizar', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// ── Inventario ────────────────────────────────────────────────────────────────

export const getInsumos = () => fetchJSON('/api/insumos');

export const postInsumo = (data: object) =>
  fetchJSON('/api/insumos', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// ── Misiones ──────────────────────────────────────────────────────────────────

export const getMisiones = () => fetchJSON('/api/misiones');

// ── Auditoría / Movimientos ───────────────────────────────────────────────────

/**
 * Obtiene los movimientos globales para MissionsGrid y Auditoría.
 * Sincronizado para evitar Error 404.
 */
export const getMovimientosGlobales = (limit = 100) =>
  fetchJSON(`/api/movimientos?limit=${limit}`);

export const getMovimientosPorInsumo = (insumoId: string) =>
  fetchJSON(`/api/insumos/${insumoId}/movimientos`);

export const postMovimiento = (data: {
  insumo_id: string;
  tipo_movimiento: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  observacion?: string;
  origen?: 'interno' | 'publico' | 'corporativo';
}) =>
  fetchJSON('/api/movimientos', {
    method: 'POST',
    body: JSON.stringify({ origen: 'interno', ...data }),
  });

// ── Analítica ──────────────────────────────────────────────────────────────────

export const getForecast = (limit = 20) =>
  fetchJSON(`/api/forecast?limit=${limit}`);

// ── Admin ──────────────────────────────────────────────────────────────────────

export const getAdminResumen = () => fetchJSON('/api/admin/resumen');

// ── B2C Público / Donaciones ───────────────────────────────────────────────────

/**
 * Obtiene historias de éxito. Corregido para evitar el 404 en PortalImpacto.
 */
export const getImpactStories = (limit = 10) =>
  fetchJSON(`/api/impacto/historias?limit=${limit}`);

/**
 * Resumen de métricas de impacto (familias, comidas, etc.)
 */
export const getImpactoResumen = () => fetchJSON('/api/impacto/resumen');

/**
 * Registra una donación monetaria. 
 * Apunta a /api/donaciones/general para coincidir con el backend final.
 */
export const postDonacionGeneral = (monto: number) =>
  fetchJSON('/api/donaciones/general', {
    method: 'POST',
    body: JSON.stringify({ monto }),
  });

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

export const patrocinarMision = (insumoId: string, consumoEstimado: number) =>
  resolverMision(insumoId, consumoEstimado, 'corporativo');

// ── Compatibilidad con código anterior ────────────────────────────────────────

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