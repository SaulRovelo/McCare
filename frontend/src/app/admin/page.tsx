'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  getAdminResumen, getInsumos, getMisiones,
  getMovimientosGlobales, getForecast,
  resolverMision,
} from '@/services/api';
import KpiStrip from '@/components/KpiStrip';
import InsightPanel from '@/components/InsightPanel';
import ForecastBarChart from '@/components/ForecastBarChart';
import MisionCard from '@/components/MisionCard';
import InsumoGrid from '@/components/InsumoGrid';
import HistorialTimeline from '@/components/HistorialTimeline';
import ForecastTable from '@/components/ForecastTable';
import InsumoTable from '@/components/InsumoTable';
import MovimientoModal from '@/components/MovimientoModal';
import Link from 'next/link';

type ViewKey = 'mando' | 'misiones' | 'inventario' | 'forecast' | 'auditoria';

const NAV: { id: ViewKey; icon: string; label: string }[] = [
  { id: 'mando',     icon: '📊', label: 'Centro de Mando'   },
  { id: 'misiones',  icon: '🚨', label: 'Misiones'          },
  { id: 'inventario',icon: '📦', label: 'Inventario'        },
  { id: 'forecast',  icon: '📈', label: 'Forecast Analítico'},
  { id: 'auditoria', icon: '🗄️', label: 'Auditoría'         },
];

export default function AdminPortal() {
  const [view, setView]           = useState<ViewKey>('mando');
  const [resumen, setResumen]     = useState<any>(null);
  const [insumos, setInsumos]     = useState<any[]>([]);
  const [misiones, setMisiones]   = useState<any[]>([]);
  const [movimientos, setMovimien]= useState<any[]>([]);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [feedback, setFeedback]   = useState('');
  const [showModal, setShowModal] = useState(false);

  const insumosMap = Object.fromEntries(insumos.map(i => [i.id, i.nombre]));

  const fetchAll = useCallback(async () => {
    try {
      const [r, ins, mis, mov, fc] = await Promise.all([
        getAdminResumen(),
        getInsumos(),
        getMisiones(),
        getMovimientosGlobales(20),
        getForecast(20),
      ]);
      setResumen(r);
      setInsumos(ins);
      setMisiones(mis);
      setMovimien(mov);
      setForecasts(fc);
      setHasLoaded(true);
    } catch { /* silencioso — el UI muestra estado de carga */ }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleResolver = async (insumo_id: string) => {
    const insumo = insumos.find(i => i.id === insumo_id);
    if (!insumo) return;
    await resolverMision(insumo_id, insumo.consumo_diario, 'interno');
    setFeedback(`✅ ${insumo.nombre} reabastecido correctamente.`);
    setTimeout(() => setFeedback(''), 4000);
    await fetchAll();
  };

  return (
    <main className="h-screen bg-slate-50 font-sans text-slate-800 flex overflow-hidden">

      {/* Toast feedback */}
      {feedback && (
        <div className="fixed bottom-8 right-8 z-[9999] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 anim-slide-bottom ring-2 ring-white/20">
          <span className="text-lg">📥</span>
          <p className="font-semibold text-sm">{feedback}</p>
        </div>
      )}

      {/* Modal de movimiento */}
      {showModal && (
        <MovimientoModal
          insumos={insumos}
          onSuccess={async () => { setShowModal(false); setFeedback('✅ Movimiento registrado.'); setTimeout(() => setFeedback(''), 4000); await fetchAll(); }}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* ── Sidebar Compacto ──────────────────────────────────────────── */}
      <aside className="w-56 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col shrink-0 h-full">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md">M</div>
            <span className="text-xl font-black text-white tracking-tighter">Admin</span>
          </div>
        </div>

        {/* Estado rápido */}
        {resumen && (
          <div className="mx-3 my-4 rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 py-2.5 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${resumen.estado_general === 'critico' ? 'bg-rose-500 animate-pulse-urgente' : resumen.estado_general === 'alerta' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
              {resumen.estado_general}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-1 overflow-y-auto pb-4">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-xs font-bold outline-none
                ${view === item.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">{item.icon}</span>
                {item.label}
              </div>
              {item.id === 'misiones' && misiones.length > 0 && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${view === 'misiones' ? 'bg-rose-500 text-white' : 'bg-rose-600 text-white'}`}>
                  {misiones.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Acciones principales fijo abajo */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {misiones.length > 0 && (
             <button onClick={() => setView('misiones')}
               className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black bg-rose-600 text-white hover:bg-rose-500 transition-all shadow-md anim-pulse-urgente">
               <span>⚡</span> Resolver Críticos
             </button>
          )}
          <button onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all">
            <span>➕</span> Registrar Movimiento
          </button>
          <Link href="/impacto" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all justify-center mt-1">
            <span>🌍</span> View Donante
          </Link>
        </div>
      </aside>

      {/* ── Contenido principal ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Main Content Area */}
        <section className="flex-1 overflow-y-auto p-8">
          {!hasLoaded ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"/>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Conectando...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header integrado en vistas para ahorrar espacio */}
              <div className="mb-6">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-3">
                  {NAV.find(n => n.id === view)?.label}
                </h1>
                {view === 'mando' && <KpiStrip resumen={resumen} />}
              </div>

              {view === 'mando'      && <ViewMando misiones={misiones} forecasts={forecasts} movimientos={movimientos} insumosMap={insumosMap} onResolver={handleResolver} />}
              {view === 'misiones'   && <ViewMisiones misiones={misiones} onResolver={handleResolver} />}
              {view === 'inventario' && <ViewInventario insumos={insumos} onRegistrar={() => setShowModal(true)} />}
              {view === 'forecast'   && <ViewForecast forecasts={forecasts} />}
              {view === 'auditoria'  && <ViewAuditoria movimientos={movimientos} insumos={insumos} insumosMap={insumosMap} />}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

// ────────────────────────────────────────────────────── Vistas individuales

function ViewMando({ misiones, forecasts, movimientos, insumosMap, onResolver }: any) {
  return (
    <div className="space-y-6 fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Columna Izquierda */}
        <div className="space-y-6">
          {/* Alertas Automáticas */}
          <div>
            <h3 className="font-black tracking-tight text-slate-900 mb-3 text-sm">Alertas Automáticas</h3>
            <InsightPanel forecasts={forecasts} />
          </div>

          {/* Misiones Rápidas */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-black tracking-tight text-slate-900 mb-4 text-sm">Requiere Atención</h3>
            {misiones.length === 0 ? (
               <p className="text-xs text-slate-500 font-medium">No hay misiones críticas activas.</p>
            ) : (
              <div className="space-y-2">
                {misiones.slice(0, 3).map((m: any) => (
                  <div key={m.id} className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex justify-between items-center sm:gap-4">
                    <div className="min-w-0 pr-2">
                      <p className="font-black text-rose-900 text-sm truncate">{m.nombre_insumo}</p>
                      <p className="text-[10px] uppercase font-bold text-rose-600 truncate">{m.mensaje}</p>
                    </div>
                    <button onClick={() => onResolver(m.insumo_id)}
                      className="shrink-0 bg-rose-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-rose-500 transition-all shadow-sm">
                      Resolver
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="space-y-6">
          <ForecastBarChart forecasts={forecasts} />
        </div>
      </div>

      {/* Timeline inferior */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="font-black tracking-tight text-slate-900 mb-4 text-sm">Auditoría Reciente</h3>
        <HistorialTimeline movimientos={movimientos.slice(0, 5)} insumosMap={insumosMap} />
      </div>
    </div>
  );
}

function ViewMisiones({ misiones, onResolver }: any) {
  return (
    <div className="fade-in max-w-3xl space-y-6">
      {misiones.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-16 text-center shadow-sm">
          <span className="text-6xl block mb-4">🙌</span>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">Todo bajo control</h3>
          <p className="text-slate-500 font-medium">No hay insumos bajo su nivel crítico en este momento.</p>
        </div>
      ) : (
        misiones.map((m: any) => <MisionCard key={m.id} mision={m} onResolver={onResolver} />)
      )}
    </div>
  );
}

function ViewInventario({ insumos, onRegistrar }: any) {
  return (
    <div className="fade-in space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 font-semibold text-sm">{insumos.length} insumos en catálogo</p>
        <button onClick={onRegistrar}
          className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-2">
          <span>➕</span> Registrar Movimiento
        </button>
      </div>
      <InsumoGrid insumos={insumos} />
    </div>
  );
}

function ViewForecast({ forecasts }: any) {
  const criticos  = forecasts.filter((f: any) => f.estado_forecast === 'critico').length;
  const atencion  = forecasts.filter((f: any) => f.estado_forecast === 'atencion').length;
  const estables  = forecasts.filter((f: any) => f.estado_forecast === 'estable').length;
  const sinDatos  = forecasts.filter((f: any) => f.estado_forecast === 'sin_datos').length;

  return (
    <div className="fade-in space-y-6">
      {/* Resumen de estados */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Críticos',  value: criticos,  color: 'text-rose-600',    bg: 'bg-rose-50',   border: 'border-rose-100'   },
          { label: 'Atención',  value: atencion,  color: 'text-amber-600',   bg: 'bg-amber-50',  border: 'border-amber-100'  },
          { label: 'Estables',  value: estables,  color: 'text-emerald-600', bg: 'bg-emerald-50',border: 'border-emerald-100'},
          { label: 'Sin datos', value: sinDatos,  color: 'text-slate-400',   bg: 'bg-slate-50',  border: 'border-slate-200'  },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-5`}>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-3 text-xs font-semibold text-indigo-700">
        ℹ️ El forecast usa <strong>Promedio Móvil Simple</strong> sobre movimientos de tipo "salida" de los últimos 30 días. Sin historial: fallback a consumo_diario base.
      </div>

      <ForecastTable forecasts={forecasts} />
    </div>
  );
}

function ViewAuditoria({ movimientos, insumos, insumosMap }: any) {
  return (
    <div className="fade-in grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-1">
        <HistorialTimeline movimientos={movimientos} insumosMap={insumosMap} />
      </div>
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
        <h3 className="font-black text-slate-900 tracking-tight mb-5">Registro SQL Completo</h3>
        <div className="overflow-x-auto">
          <InsumoTable insumos={insumos} />
        </div>
      </div>
    </div>
  );
}
