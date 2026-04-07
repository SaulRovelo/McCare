'use client';

interface ForecastItem {
  nombre: string;
  categoria: string;
  stock_actual: number;
  nivel_critico: number;
  dias_para_nivel_critico: number;
  dias_para_agotarse: number;
  estado_forecast: 'critico' | 'atencion' | 'estable' | 'sin_datos';
  confianza_basica: 'alta' | 'media' | 'baja';
  consumo_estimado: number;
  mensaje_forecast: string;
}

const MAX_DIAS = 30;

function getRisk(f: ForecastItem): 'immediate' | 'urgent' | 'watch' | 'ok' {
  if (f.dias_para_agotarse <= 1) return 'immediate';
  if (f.estado_forecast === 'critico') return 'urgent';
  if (f.estado_forecast === 'atencion') return 'watch';
  return 'ok';
}

const cfg = {
  immediate: { icon: '🔥', barColor: 'bg-rose-500',   textColor: 'text-rose-700',   bgCard: 'bg-rose-50',     border: 'border-rose-200',  label: '<24 h',   pulse: true  },
  urgent:    { icon: '⚠️', barColor: 'bg-orange-400',  textColor: 'text-orange-700', bgCard: 'bg-orange-50/60',border: 'border-orange-200',label: 'Crítico', pulse: false },
  watch:     { icon: '📊', barColor: 'bg-amber-400',   textColor: 'text-amber-700',  bgCard: 'bg-amber-50/40', border: 'border-amber-100',  label: 'Atención',pulse: false },
  ok:        { icon: '✅', barColor: 'bg-emerald-400', textColor: 'text-emerald-700',bgCard: 'bg-white',       border: 'border-slate-100',  label: 'Estable', pulse: false },
} as const;

function diasLabel(d: number): string {
  if (d <= 0)  return 'AHORA';
  if (d < 1)   return `${Math.round(d * 24)}h`;
  if (d < 2)   return `${Math.round(d * 24)}h`;
  return `${Math.round(d)}d`;
}

/** Card grande para el TOP-3 crítico */
function HeroCard({ f, rank }: { f: ForecastItem & { _risk: ReturnType<typeof getRisk> }; rank: number }) {
  const c    = cfg[f._risk];
  const pct  = Math.min((Math.max(0, f.dias_para_nivel_critico) / MAX_DIAS) * 100, 100);

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bgCard} p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${c.pulse ? 'ring-1 ring-rose-300' : ''}`}>
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{c.icon}</span>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${c.border} ${c.textColor} bg-white/80`}>
            #{rank} · {c.label}
          </span>
        </div>
        <span className={`text-xl font-black ${c.textColor}`}>
          {diasLabel(f.dias_para_nivel_critico)}
        </span>
      </div>

      <h4 className="font-black text-slate-900 text-base leading-tight mb-1">{f.nombre}</h4>
      <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-4">{f.categoria}</p>

      {/* Barra */}
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-700 ${c.barColor} ${c.pulse ? 'animate-pulse' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        <div className="rounded-xl bg-white/70 border border-slate-100 py-2 px-1">
          <p className="text-xs font-black text-slate-800">{f.stock_actual}</p>
          <p className="text-[10px] text-slate-400">stock</p>
        </div>
        <div className="rounded-xl bg-white/70 border border-slate-100 py-2 px-1">
          <p className="text-xs font-black text-slate-800">{f.consumo_estimado.toFixed(1)}</p>
          <p className="text-[10px] text-slate-400">cons./día</p>
        </div>
        <div className="rounded-xl bg-white/70 border border-slate-100 py-2 px-1">
          <p className={`text-xs font-black ${c.textColor}`}>{diasLabel(f.dias_para_agotarse)}</p>
          <p className="text-[10px] text-slate-400">fin stock</p>
        </div>
      </div>

      {/* CTA */}
      <button className={`w-full rounded-xl py-2.5 text-sm font-black transition-colors text-white ${
        f._risk === 'immediate' ? 'bg-rose-600 hover:bg-rose-700' :
        f._risk === 'urgent'   ? 'bg-orange-500 hover:bg-orange-600' :
                                  'bg-amber-500 hover:bg-amber-600'
      }`}>
        ❤️ Donar ahora
      </button>
    </div>
  );
}

/** Fila compacta para el resto */
function CompactRow({ f }: { f: ForecastItem & { _risk: ReturnType<typeof getRisk> } }) {
  const c   = cfg[f._risk];
  const pct = Math.min((Math.max(0, f.dias_para_nivel_critico) / MAX_DIAS) * 100, 100);

  return (
    <div className={`flex items-center gap-3 rounded-xl border ${c.border} ${c.bgCard} px-4 py-3 transition-all hover:shadow-sm`}>
      <span className="text-sm leading-none shrink-0">{c.icon}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="text-sm font-bold text-slate-800 truncate">{f.nombre}</p>
          <span className={`text-xs font-black shrink-0 ${c.textColor}`}>{diasLabel(f.dias_para_nivel_critico)}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div className={`h-full rounded-full ${c.barColor}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Mini métricas */}
      <div className="shrink-0 text-right hidden sm:block">
        <p className="text-xs font-bold text-slate-700">{f.stock_actual}</p>
        <p className="text-[10px] text-slate-400">{f.consumo_estimado.toFixed(1)}/d</p>
      </div>
    </div>
  );
}

export default function ForecastBarChart({ forecasts }: { forecasts: ForecastItem[] }) {
  if (!forecasts || forecasts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-slate-400 font-semibold text-sm">Cargando timeline…</p>
      </div>
    );
  }

  const order = { immediate: 0, urgent: 1, watch: 2, ok: 3 } as const;
  const ordenados = [...forecasts]
    .map(f => ({ ...f, _risk: getRisk(f) }))
    .sort((a, b) => order[a._risk] - order[b._risk]);

  const top3    = ordenados.filter(f => f._risk === 'immediate' || f._risk === 'urgent').slice(0, 3);
  const resto   = ordenados.filter(f => !top3.includes(f as any));

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-800 tracking-tight">Timeline de Riesgo</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          días → crítico
        </span>
      </div>

      {/* TOP 3 */}
      {top3.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">
            🔥 Requieren acción inmediata
          </p>
          {top3.map((f, i) => (
            <HeroCard key={f.nombre} f={f} rank={i + 1} />
          ))}
        </div>
      )}

      {/* Divisor */}
      {top3.length > 0 && resto.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resto del inventario</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>
      )}

      {/* Resto compacto */}
      {resto.length > 0 && (
        <div className="flex flex-col gap-2">
          {resto.slice(0, 8).map(f => <CompactRow key={f.nombre} f={f} />)}
          {resto.length > 8 && (
            <p className="text-center text-[11px] text-slate-400 font-medium pt-1">
              +{resto.length - 8} insumos estables más
            </p>
          )}
        </div>
      )}

      {/* Leyenda */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 border-t border-slate-100">
        {[
          { icon: '🔥', label: '<24 h',     color: 'text-rose-500'   },
          { icon: '⚠️', label: 'Crítico',   color: 'text-orange-500' },
          { icon: '📊', label: 'Atención',  color: 'text-amber-500'  },
          { icon: '✅', label: 'Estable',   color: 'text-emerald-500'},
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <span className="text-xs">{l.icon}</span>
            <span className={`text-[10px] font-medium ${l.color}`}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
