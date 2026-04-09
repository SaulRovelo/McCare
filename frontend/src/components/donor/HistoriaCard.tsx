'use client';
import React, { useState } from 'react';
import BarraProgreso from '@/components/BarraProgreso';

/**
 * HistoriaCard v2 — Rediseño completo.
 * Compacta para prevención, expandida para rescate crítico.
 * Con barra de cobertura, urgencia visual y feedback post-donación.
 */

export default function HistoriaCard({
  story,
  onDonar,
}: {
  story: any;
  onDonar: (insumo_id: string, nombre: string) => Promise<{ familias: number }>;
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
  const isCritico = story.tipo_historia === 'rescate_critico';

  // Indicador de tiempo — ahora viene directo del backend para que haga match perfecto
  const diasRestantes: number = parseFloat(story.dias_restantes) || 0;
  const tiempoLabel = story.tiempo_texto || story.urgencia_label || 'Calculando...';

  // Barra: cobertura actual vs 14 días como referencia "saludable"
  const coberturaMax = 14;
  const coberturaVal = Math.min(diasRestantes, coberturaMax);

  const handleClick = async () => {
    if (state !== 'idle') return;
    setState('loading');
    await onDonar(story.insumo_id, story.nombre_insumo);
    setState('done');
  };

  if (state === 'done') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3 anim-fade-in">
        <span className="text-2xl">✅</span>
        <div>
          <p className="font-bold text-emerald-800 text-sm">¡Misión apoyada!</p>
          <p className="text-emerald-600 text-xs">{story.nombre_insumo} — inventario actualizado</p>
        </div>
      </div>
    );
  }

  if (isCritico) {
    // Card expandida para rescate crítico
    return (
      <div className={`rounded-xl border bg-white overflow-hidden transition-all duration-200 hover:-translate-y-0.5 anim-slide-bottom
        border-l-4 border-l-rose-500 border-rose-100 hover:shadow-lg hover:shadow-rose-100
        ${state === 'loading' ? 'opacity-70' : ''}`}>

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                  Rescate crítico
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{story.categoria}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">{story.nombre_insumo}</h3>
            </div>

            {/* Botón principal */}
            <button
              onClick={handleClick}
              disabled={state !== 'idle'}
              className={`shrink-0 px-4 py-2.5 rounded-lg font-black text-sm transition-all whitespace-nowrap
                ${state === 'loading'
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-200 hover:shadow-rose-300 hover:-translate-y-0.5 active:translate-y-0 anim-pulse-urgente'}`}
            >
              {state === 'loading' ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-rose-300 border-t-white rounded-full animate-spin inline-block" />
                  Procesando...
                </span>
              ) : story.accion_label}
            </button>
          </div>

          {/* Barra de cobertura */}
          <BarraProgreso value={coberturaVal} max={coberturaMax} animated color="urgente" height="thin" />

          {/* Pie de datos */}
          <div className="flex items-center gap-4 mt-2.5 text-xs font-medium text-slate-500">
            <span>{tiempoLabel}</span>
            <span className="text-slate-300">·</span>
            <span>
              <strong className="text-slate-700">{story.impacto_resumido}</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Card compacta para prevención
  return (
    <div className={`rounded-xl border bg-white overflow-hidden transition-all duration-200 hover:-translate-y-0.5 anim-slide-bottom
      border-l-4 border-l-amber-400 border-amber-100 hover:shadow-md hover:shadow-amber-50
      ${state === 'loading' ? 'opacity-70' : ''}`}>

      <div className="p-3.5 flex items-center gap-3">
        {/* Estado */}
        <span className="shrink-0 text-amber-500 text-lg">⚠️</span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-bold text-slate-900 text-sm truncate">{story.nombre_insumo}</p>
            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider shrink-0">{story.categoria}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span>{tiempoLabel}</span>
            <span className="text-slate-300">·</span>
            <span className="font-medium">{story.impacto_resumido}</span>
          </div>
          <BarraProgreso value={coberturaVal} max={coberturaMax} animated color="atencion" height="thin" />
        </div>

        {/* Botón compacto */}
        <button
          onClick={handleClick}
          disabled={state !== 'idle'}
          className={`shrink-0 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap
            ${state === 'loading'
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-amber-500 text-amber-950 hover:bg-amber-400 hover:-translate-y-0.5 shadow-sm'}`}
        >
          {state === 'loading' ? '...' : 'Prevenir'}
        </button>
      </div>
    </div>
  );
}
