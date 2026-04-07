'use client';
/**
 * ForecastBarChart — Gráfica de barras horizontales CSS puras.
 * Sin librería externa. Barras coloreadas por semáforo con animación escalonada.
 */

interface ForecastItem {
  nombre: string;
  categoria: string;
  dias_para_nivel_critico: number;
  dias_para_agotarse: number;
  estado_forecast: 'critico' | 'atencion' | 'estable' | 'sin_datos';
  confianza_basica: 'alta' | 'media' | 'baja';
  consumo_estimado: number;
}

const barColor = {
  critico:   'bg-rose-500',
  atencion:  'bg-amber-400',
  estable:   'bg-emerald-500',
  sin_datos: 'bg-slate-300',
};

const labelColor = {
  critico:   'text-rose-600',
  atencion:  'text-amber-600',
  estable:   'text-emerald-600',
  sin_datos: 'text-slate-400',
};

const MAX_DIAS_DISPLAY = 30; // escala de la gráfica

export default function ForecastBarChart({ forecasts }: { forecasts: ForecastItem[] }) {
  if (!forecasts || forecasts.length === 0) return null;

  // Ordenar por días para nivel crítico (más urgentes primero)
  const ordenados = [...forecasts].sort((a, b) => a.dias_para_nivel_critico - b.dias_para_nivel_critico);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-black text-slate-900 text-base tracking-tight">Proyección de Stock</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Días hasta nivel crítico
        </span>
      </div>

      <div className="space-y-3">
        {ordenados.map((f, i) => {
          const dias = Math.max(0, f.dias_para_nivel_critico);
          const pct = Math.min((dias / MAX_DIAS_DISPLAY) * 100, 100);
          const col = barColor[f.estado_forecast];
          const txtCol = labelColor[f.estado_forecast];

          return (
            <div key={f.nombre} className="group">
              <div className="flex items-center gap-3 mb-1">
                {/* Nombre */}
                <p className="text-sm font-bold text-slate-700 w-40 truncate shrink-0" title={f.nombre}>
                  {f.nombre}
                </p>

                {/* Barra */}
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full anim-bar-fill ${col}`}
                    style={{
                      ['--bar-target' as string]: `${pct}%`,
                      animationDelay: `${i * 80}ms`,
                    }}
                  />
                </div>

                {/* Valor */}
                <p className={`text-xs font-black w-16 text-right shrink-0 ${txtCol}`}>
                  {dias === 0 ? 'AHORA' : dias < 1 ? `${Math.round(dias*24)}h` : `${Math.round(dias)}d`}
                </p>
              </div>

              {/* Tooltip expandido al hacer hover */}
              <div className="hidden group-hover:flex items-center gap-3 pl-[176px] text-[10px] text-slate-400 font-medium">
                <span>Consumo: {f.consumo_estimado.toFixed(1)}/día</span>
                <span>·</span>
                <span>Se agota en: {Math.round(f.dias_para_agotarse)}d</span>
                <span>·</span>
                <span>Confianza: {f.confianza_basica}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda escala */}
      <div className="flex justify-between text-[10px] text-slate-300 font-medium mt-4 pt-3 border-t border-slate-100">
        <span>0d</span>
        <span>7d</span>
        <span>14d</span>
        <span>21d</span>
        <span>≥{MAX_DIAS_DISPLAY}d ✓</span>
      </div>
    </div>
  );
}
