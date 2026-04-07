'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  getCorporativoResumen,
  getMisionesFinanciables,
  getReporteCorporativo,
  patrocinarMision,
} from '@/services/api';
import Link from 'next/link';

type PeriodoKey = 7 | 30 | 90;
type ViewKey = 'resumen' | 'misiones' | 'historial' | 'recomendaciones';

const PERIODOS: { value: PeriodoKey; label: string }[] = [
  { value: 7,  label: 'Últimos 7 días'  },
  { value: 30, label: 'Últimos 30 días' },
  { value: 90, label: 'Últimos 90 días' },
];

const NAV: { id: ViewKey; icon: string; label: string }[] = [
  { id: 'resumen',         icon: '📊', label: 'Resumen Ejecutivo'      },
  { id: 'misiones',        icon: '🎯', label: 'Misiones Financiables'  },
  { id: 'historial',       icon: '📋', label: 'Historial de Impacto'   },
  { id: 'recomendaciones', icon: '🔮', label: 'Prevención Inteligente' },
];

const estadoConfig = {
  critico: { color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-200',    dot: 'bg-rose-500'    },
  alerta:  { color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-400'   },
  optimo:  { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
};

export default function PortalCorporativo() {
  const [view, setView]     = useState<ViewKey>('resumen');
  const [periodo, setPeriodo] = useState<PeriodoKey>(30);
  const [resumen, setResumen]   = useState<any>(null);
  const [misiones, setMisiones] = useState<any[]>([]);
  const [reporte, setReporte]   = useState<any>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [patrocinando, setPatrocinando] = useState<string | null>(null);
  const [toast, setToast]     = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [r, m, rep] = await Promise.all([
        getCorporativoResumen(periodo),
        getMisionesFinanciables(),
        getReporteCorporativo(periodo),
      ]);
      setResumen(r);
      setMisiones(m);
      setReporte(rep);
      setHasLoaded(true);
    } catch (e) {
      console.error(e);
    }
  }, [periodo]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handlePatrocinar = async (mision: any, dias: number = 14) => {
    setPatrocinando(mision.insumo_id);
    try {
      const consumo = mision.consumo_estimado ?? 5; // fallback
      const cantidad = Math.max(1, Math.round(consumo * dias));
      
      await patrocinarMision(mision.insumo_id, cantidad);
      setToast(`✅ Patrocinio de ${dias} días registrado para ${mision.nombre_insumo}. Trazabilidad activa.`);
      setTimeout(() => setToast(''), 5000);
      await fetchAll();
    } catch {
      setToast('⚠️ Error al registrar el patrocinio. Intenta nuevamente.');
      setTimeout(() => setToast(''), 4000);
    } finally {
      setPatrocinando(null);
    }
  };

  const handleExport = () => {
    if (!reporte) return;
    const blob = new Blob([JSON.stringify(reporte, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mccare-reporte-esg-${periodo}d-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast('📄 Reporte ESG exportado correctamente.');
    setTimeout(() => setToast(''), 3000);
  };

  const estado = resumen ? estadoConfig[resumen.estado_general as keyof typeof estadoConfig] : null;
  const historialEntradas = reporte?.historial_entradas ?? [];
  const recomendaciones   = reporte?.recomendaciones_predictivas ?? [];

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans flex">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[999] bg-white text-slate-900 px-6 py-4 rounded-2xl shadow-2xl border border-slate-200 font-semibold text-sm max-w-sm anim-slide-bottom">
          {toast}
        </div>
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-72 bg-slate-950 flex flex-col shrink-0 h-screen sticky top-0">

        {/* Logo */}
        <div className="px-6 py-7 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-900">M</div>
            <span className="text-xl font-black text-white tracking-tighter">McCare</span>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-12">Portal Corporativo RSE</p>
        </div>

        {/* Indicador de estado */}
        {resumen && estado && (
          <div className="mx-4 mt-4 mb-2 rounded-2xl bg-slate-800 border border-slate-700 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${estado.dot} animate-pulse`}/>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {resumen.estado_general}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium leading-snug">{resumen.frase_ejecutiva}</p>
          </div>
        )}

        {/* Selector de período */}
        <div className="px-4 pb-2 pt-1">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Período de análisis</p>
          <div className="grid grid-cols-3 gap-1">
            {PERIODOS.map(p => (
              <button key={p.value} onClick={() => setPeriodo(p.value)}
                className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all
                  ${periodo === p.value ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}>
                {p.value}d
              </button>
            ))}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-4 mt-2">
          {NAV.map(item => (
            <button key={item.id} onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-sm font-bold outline-none
                ${view === item.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Acciones */}
        <div className="px-4 pb-6 pt-2 border-t border-slate-800 space-y-2 mt-2">
          <button onClick={handleExport} disabled={!reporte}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-indigo-400 hover:bg-slate-800 hover:text-indigo-300 transition-all disabled:opacity-40">
            <span>📄</span> Exportar Reporte ESG
          </button>
          <Link href="/impacto" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all">
            <span>❤️</span> Vista Donante
          </Link>
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all">
            <span>⚙️</span> Portal Admin
          </Link>
        </div>
      </aside>

      {/* ── Contenido Principal ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Header */}
        <header className="px-10 py-6 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">
              {NAV.find(n => n.id === view)?.label}
            </h1>
            {resumen && (
              <p className="text-slate-400 text-sm font-medium mt-0.5">
                {resumen.misiones_financiables} misiones · {resumen.familias_potenciales} familias potenciales · {PERIODOS.find(p => p.value === periodo)?.label}
              </p>
            )}
          </div>
          <button onClick={handleExport} disabled={!reporte}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all shadow-lg disabled:opacity-40 flex items-center gap-2">
            <span>📄</span> Descargar Reporte
          </button>
        </header>

        {/* Body */}
        <section className="flex-1 overflow-y-auto p-8 bg-slate-900">
          {!hasLoaded ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin mx-auto mb-4"/>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando datos del sistema...</p>
              </div>
            </div>
          ) : (
            <>
              {view === 'resumen'         && <ViewResumen resumen={resumen} misiones={misiones} />}
              {view === 'misiones'        && <ViewMisiones misiones={misiones} patrocinando={patrocinando} onPatrocinar={handlePatrocinar} />}
              {view === 'historial'       && <ViewHistorial entradas={historialEntradas} />}
              {view === 'recomendaciones' && <ViewRecomendaciones items={recomendaciones} patrocinando={patrocinando} onPatrocinar={handlePatrocinar} />}
            </>
          )}
        </section>
      </div>
    </main>
  );
}


// ─── Vistas individuales ──────────────────────────────────────────────────────

function ViewResumen({ resumen, misiones }: any) {
  if (!resumen) return null;
  const estado = estadoConfig[resumen.estado_general as keyof typeof estadoConfig];

  return (
    <div className="space-y-6 fade-in">
      {/* KPIs C-level */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Misiones abiertas',    value: resumen.misiones_financiables, sub: 'Para financiamiento',     color: 'text-white'          },
          { label: 'Urgencias críticas',   value: resumen.misiones_criticas,     sub: 'Intervención inmediata',  color: 'text-rose-400'        },
          { label: 'Prevenciones activas', value: resumen.misiones_preventivas,  sub: 'Forecast 30 días',        color: 'text-amber-400'       },
          { label: 'Familias potenciales', value: resumen.familias_potenciales,  sub: 'Beneficio estimado total', color: 'text-indigo-400'      },
        ].map(k => (
          <div key={k.label} className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <p className={`text-4xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">{k.label}</p>
            <p className="text-slate-500 text-[11px] font-medium mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Segunda fila de KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <p className="text-3xl font-black text-emerald-400">{resumen.unidades_entrada_periodo}</p>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Unidades recibidas</p>
          <p className="text-slate-500 text-[11px] mt-0.5">Entradas en el período</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <p className="text-3xl font-black text-blue-400">{resumen.cobertura_promedio_dias}d</p>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Cobertura promedio</p>
          <p className="text-slate-500 text-[11px] mt-0.5">Stock actual / consumo</p>
        </div>
        <div className={`rounded-2xl p-5 border ${estado.bg.replace('bg-', 'bg-opacity-10 bg-')} border-opacity-20 ${estado.border}`}>
          <div className="flex items-center gap-2 mb-2">
             <span className={`w-3 h-3 rounded-full ${estado.dot} ${resumen.estado_general === 'critico' ? 'animate-pulse-urgente' : 'animate-pulse'}`}/>
            <span className={`text-[10px] font-black uppercase tracking-widest ${estado.color}`}>{resumen.estado_general}</span>
          </div>
          <p className="text-white text-sm font-semibold leading-snug">{resumen.frase_ejecutiva}</p>
        </div>
      </div>

      {/* Preview de misiones top 3 */}
      {misiones.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h3 className="font-black text-white tracking-tight mb-4 flex items-center gap-2">
            <span>🎯</span> Misiones de Mayor Urgencia
          </h3>
          <div className="space-y-3">
            {misiones.slice(0, 3).map((m: any) => (
              <div key={m.id} className="flex items-center gap-4 py-3 border-b border-slate-700/50 last:border-0">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg shrink-0
                  ${m.tipo === 'rescate_critico' ? 'bg-rose-900/50 text-rose-400 border border-rose-800' : 'bg-amber-900/50 text-amber-400 border border-amber-800'}`}>
                  {m.tipo === 'rescate_critico' ? 'CRÍTICO' : 'PREVENCIÓN'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{m.nombre_insumo}</p>
                  <p className="text-slate-400 text-xs">{m.categoria} · {m.impacto_familias} familias · {m.cobertura_actual_dias}d cobertura</p>
                </div>
                <p className="text-slate-400 text-xs font-medium shrink-0">{m.inversion_estimada_label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ViewMisiones({ misiones, patrocinando, onPatrocinar }: any) {
  const criticas   = misiones.filter((m: any) => m.tipo === 'rescate_critico');
  const preventivas = misiones.filter((m: any) => m.tipo === 'prevencion_inteligente');

  if (misiones.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <span className="text-5xl block mb-4">🕊️</span>
          <p className="text-slate-400 font-bold text-lg">No hay misiones financiables en este momento.</p>
          <p className="text-slate-500 text-sm mt-1">El inventario opera dentro de los parámetros seguros.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {criticas.length > 0 && (
        <div>
          <h3 className="text-white font-black tracking-tight text-lg mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse inline-block"/>
            Intervenciones Urgentes — Financiamiento Inmediato
          </h3>
          <div className="space-y-4">
            {criticas.map((m: any) => (
              <MisionFinanciableCard key={m.id} mision={m} patrocinando={patrocinando} onPatrocinar={onPatrocinar} />
            ))}
          </div>
        </div>
      )}
      {preventivas.length > 0 && (
        <div>
          <h3 className="text-white font-black tracking-tight text-lg mb-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"/>
            Prevención Estratégica — Intervención Planificada
          </h3>
          <p className="text-slate-400 text-sm font-medium mb-4 ml-5">
            La intervención preventiva tiene menor costo logístico que un rescate de emergencia.
          </p>
          <div className="space-y-4">
            {preventivas.map((m: any) => (
              <MisionFinanciableCard key={m.id} mision={m} patrocinando={patrocinando} onPatrocinar={onPatrocinar} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import BarraProgreso from '@/components/BarraProgreso';

function MisionFinanciableCard({ mision: m, patrocinando, onPatrocinar }: any) {
  const isCritico = m.tipo === 'rescate_critico';
  const isProcessing = patrocinando === m.insumo_id;
  
  // Para la barra de progreso
  const coberturaVal = Math.min(Math.max(m.cobertura_actual_dias, 0), 14);

  return (
    <div className={`border rounded-2xl p-6 transition-all
      ${isCritico
        ? 'bg-rose-950/30 border-rose-900/60 hover:border-rose-700'
        : 'bg-amber-950/20 border-amber-900/50 hover:border-amber-700'}`}>
      <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
        <div className="flex-1 min-w-0 w-full">
          {/* Header de misión */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border
              ${isCritico ? 'bg-rose-900/50 text-rose-400 border-rose-800' : 'bg-amber-900/50 text-amber-400 border-amber-800'}`}>
              {isCritico ? 'RESCATE CRÍTICO' : 'PREVENCIÓN'}
            </span>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{m.categoria}</span>
            <span className="text-slate-600 text-[10px] font-bold uppercase tracking-wider">·</span>
            <span className="text-slate-500 text-[10px] font-bold">{m.confianza} confianza</span>
          </div>

          <h4 className="text-white font-black text-xl tracking-tight mb-2">{m.nombre_insumo}</h4>
          <p className="text-slate-300 text-sm font-medium leading-relaxed mb-4">{m.descripcion_ejecutiva}</p>
          
          <div className="mb-4 max-w-sm">
             <BarraProgreso value={coberturaVal} max={14} animated color={isCritico ? 'urgente' : 'atencion'} height="thin" label="Cobertura actual (días)" />
          </div>

          {/* Métricas ejecutivas */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Familias impacto', value: m.impacto_familias },
              { label: 'Cobertura', value: `${m.cobertura_actual_dias}d` },
              { label: 'Días crisis', value: m.dias_para_critico <= 0 ? 'Ahora' : `${m.dias_para_critico}d` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-center">
                <p className="text-white font-black text-sm">{value}</p>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs (Doble botón corporativo) */}
        <div className="shrink-0 flex flex-row lg:flex-col gap-2 w-full lg:w-auto mt-2 lg:mt-0">
          <button
            onClick={() => onPatrocinar(m, 14)}
            disabled={isProcessing}
            className={`flex-1 px-5 py-3 rounded-xl font-black text-sm transition-all whitespace-nowrap text-center
              ${isProcessing
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : isCritico
                  ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-900/50 hover:-translate-y-0.5 anim-pulse-urgente'
                  : 'bg-amber-500 text-amber-950 hover:bg-amber-400 shadow-lg shadow-amber-900/50 hover:-translate-y-0.5'}`}>
            {isProcessing ? 'Registrando...' : `Asegurar 14 días`}
          </button>
          
          <button
            onClick={() => onPatrocinar(m, 30)}
            disabled={isProcessing}
            className={`flex-1 px-5 py-3 rounded-xl font-bold text-xs transition-all whitespace-nowrap text-center
              ${isProcessing
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800'
                : isCritico
                  ? 'bg-transparent text-rose-300 border border-rose-500/30 hover:bg-rose-900/30 hover:border-rose-500'
                  : 'bg-transparent text-amber-300 border border-amber-500/30 hover:bg-amber-900/30 hover:border-amber-500'}`}>
            Compromiso largo plazo (30d)
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewHistorial({ entradas }: { entradas: any[] }) {
  const origenBadge: Record<string, string> = {
    corporativo: 'bg-indigo-900/50 text-indigo-400 border-indigo-800',
    publico:     'bg-emerald-900/50 text-emerald-400 border-emerald-800',
    interno:     'bg-slate-700 text-slate-400 border-slate-600',
  };

  if (entradas.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl block mb-4">📋</span>
        <p className="text-slate-400 font-bold">No hay entradas registradas en este período.</p>
        <p className="text-slate-500 text-sm mt-1">Aumenta el período de análisis o ejecuta la simulación de datos.</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="font-black text-white tracking-tight">Entradas Verificadas al Inventario</h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{entradas.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/50">
                {['Fecha', 'Insumo', 'Categoría', 'Unidades', 'Stock post', 'Origen', 'Observación'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entradas.map((e: any, i: number) => (
                <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-[11px] font-medium">
                    {new Date(e.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-white font-bold whitespace-nowrap">{e.insumo_nombre}</td>
                  <td className="px-4 py-3 text-slate-400">{e.categoria}</td>
                  <td className="px-4 py-3 text-emerald-400 font-black">+{e.cantidad}</td>
                  <td className="px-4 py-3 text-slate-300 font-medium">{e.stock_resultante}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${origenBadge[e.origen_movimiento] ?? origenBadge.interno}`}>
                      {e.origen_movimiento}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-[11px] max-w-[200px] truncate" title={e.observacion ?? ''}>
                    {e.observacion ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ViewRecomendaciones({ items, patrocinando, onPatrocinar }: any) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl block mb-4">🎯</span>
        <p className="text-slate-400 font-bold text-lg">No hay prevenciones pendientes.</p>
        <p className="text-slate-500 text-sm mt-1">El forecast no detecta insumos en riesgo dentro de los próximos 7 días.</p>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-4">
      <div className="bg-indigo-950/40 border border-indigo-900/60 rounded-2xl px-6 py-4 text-sm font-medium text-indigo-300 leading-relaxed">
        🔮 <strong className="text-indigo-200">Motor analítico:</strong>{' '}
        Estas necesidades fueron detectadas por el modelo de Promedio Móvil Simple sobre 30 días de historial.
        La intervención preventiva reduce costos logísticos respecto a un rescate de emergencia.
        Confianza: basada en frecuencia y consistencia del historial de salidas registrado.
      </div>
      {items.map((m: any) => (
        <MisionFinanciableCard key={m.id} mision={m} patrocinando={patrocinando} onPatrocinar={onPatrocinar} />
      ))}
    </div>
  );
}
