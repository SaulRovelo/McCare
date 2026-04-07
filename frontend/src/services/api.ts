/**
 * frontend/src/services/api.ts — Capa de servicios HTTP del frontend
 *
 * Responsabilidad: centralizar todas las llamadas al backend.
 * El frontend nunca calcula reglas de negocio — solo consume JSON del API.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const fetchJSON = async (url: string, options?: RequestInit) => {
  const res = await fetch(`${API_URL}${url}`, { cache: 'no-store', ...options });
  if (!res.ok) throw new Error(`Error ${res.status} en ${url}`);
  return res.json();
};

// ── Inventario ────────────────────────────────────────────────────────────────

export const getInsumos = () => fetchJSON('/api/insumos');

export const postInsumo = (data: object) =>
  fetchJSON('/api/insumos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

// ── Misiones ──────────────────────────────────────────────────────────────────

export const getMisiones = () => fetchJSON('/api/misiones');

// ── Auditoría / Movimientos ───────────────────────────────────────────────────

export const getMovimientosGlobales = (limit = 20) =>
  fetchJSON(`/api/movimientos?limit=${limit}`);

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

export const getForecast = (limit = 20) =>
  fetchJSON(`/api/forecast?limit=${limit}`);

// ── Admin ──────────────────────────────────────────────────────────────────────

export const getAdminResumen = () => fetchJSON('/api/admin/resumen');

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
