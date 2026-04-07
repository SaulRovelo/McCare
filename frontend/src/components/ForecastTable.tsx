'use client';
import React from 'react';

interface ForecastRow {
  nombre: string;
  categoria: string;
  stock_actual: number;
  nivel_critico: number;
  consumo_estimado: number;
  consumo_base: number;
  dias_para_nivel_critico: number;
  dias_para_agotarse: number;
  estado_forecast: 'critico' | 'atencion' | 'estable' | 'sin_datos';
  metodo_usado: string;
  confianza_basica: 'alta' | 'media' | 'baja';
  mensaje_forecast: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function diasLabel(d: number, agotarse = false): string {
  if (agotarse && d <= 0.2) return '⚡ Hoy';
  if (d <= 0) return 'Umbral superado';
  if (d < 1)  return `${Math.round(d * 24)}h`;
  if (d === 1)return '1 día';
  return `${Math.round(d)} días`;
}

function impactoFamilias(consumo: number): number {
  return Math.max(1, Math.round((consumo * 7) / 3));
}

function accion(f: ForecastRow): { label: string; color: string; bg: string } {
  if (f.estado_forecast === 'critico' && f.dias_para_agotarse <= 1)
    return { label: '🚨 Comprar hoy',         color: 'text-rose-700',   bg: 'bg-rose-100 hover:bg-rose-200'   };
  if (f.estado_forecast === 'critico')
    return { label: '📦 Reabastecer urgente',  color: 'text-orange-700', bg: 'bg-orange-100 hover:bg-orange-200' };
  if (f.estado_forecast === 'atencion')
    return { label: '📋 Planificar reposición',color: 'text-amber-700',  bg: 'bg-amber-100 hover:bg-amber-200'  };
  if (f.estado_forecast === 'sin_datos')
    return { label: '📝 Registrar consumo',    color: 'text-slate-600',  bg: 'bg-slate-100 hover:bg-slate-200'  };
  return   { label: '✔ Monitoreo rutinario',  color: 'text-emerald-700',bg: 'bg-emerald-100 hover:bg-emerald-200'};
}

// ── Configuración semántica ──────────────────────────────────────────────────
const estadoCfg = {
  critico:   { icon: '🔥', label: 'CRÍTICO',    rowBg: 'bg-rose-50/60',   border: 'border-l-[3px] border-rose-400',  badge: 'bg-rose-600 text-white',             nameColor: 'text-rose-900' },
  atencion:  { icon: '⚠️', label: 'ATENCIÓN',   rowBg: 'bg-amber-50/50',  border: 'border-l-[3px] border-amber-400', badge: 'bg-amber-500 text-white',            nameColor: 'text-amber-900' },
  estable:   { icon: '✅', label: 'ESTABLE',    rowBg: 'bg-white',         border: 'border-l-[3px] border-transparent',badge: 'bg-emerald-100 text-emerald-800',  nameColor: 'text-slate-900' },
  sin_datos: { icon: '❓', label: 'SIN DATOS',  rowBg: 'bg-slate-50',     border: 'border-l-[3px] border-slate-300', badge: 'bg-slate-200 text-slate-600',        nameColor: 'text-slate-600' },
};

const confianzaCfg = {
  alta:  { dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200'  },
  media: { dot: 'bg-amber-500',   pill: 'bg-amber-50 text-amber-700 border-amber-200'        },
  baja:  { dot: 'bg-slate-400',   pill: 'bg-slate-50 text-slate-500 border-slate-200'        },
};

// ── Subcomponente: sección de grupo ─────────────────────────────────────────
function GroupSection({
  label, icon, rows, colorClass,
}: {
  label: string; icon: string; rows: ForecastRow[]; colorClass: string;
}) {
  if (rows.length === 0) return null;
  return (
    <tbody>
      <tr>
        <td colSpan={9} className="px-5 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">{icon}</span>
            <span className={`text-[11px] font-black uppercase tracking-widest ${colorClass}`}>
              {label} · {rows.length} insumo{rows.length !== 1 ? 's' : ''}
            </span>
          </div>
        </td>
      </tr>
      {rows.map((f, i) => {
        const c   = estadoCfg[f.estado_forecast];
        const con = confianzaCfg[f.confianza_basica];
        const ac  = accion(f);
        const familias = impactoFamilias(f.consumo_estimado);

        return (
          <tr
            key={i}
            className={`border-b border-slate-50 transition-colors hover:brightness-[0.97] ${c.rowBg} ${c.border}`}
          >
            {/* Insumo */}
            <td className="px-5 py-4 whitespace-nowrap min-w-[170px]">
              <p className={`font-black text-[13px] leading-tight ${c.nameColor}`}>{f.nombre}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{f.categoria}</p>
            </td>

            {/* Estado */}
            <td className="px-4 py-4 whitespace-nowrap">
              <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg ${c.badge}`}>
                {c.icon} {c.label}
              </span>
            </td>

            {/* Stock */}
            <td className="px-4 py-4 whitespace-nowrap">
              <p className={`font-black text-sm ${f.stock_actual <= f.nivel_critico ? 'text-rose-600' : 'text-slate-800'}`}>
                {f.stock_actual}
              </p>
              <p className="text-[10px] text-slate-400">mín {f.nivel_critico}</p>
            </td>

            {/* Consumo/d */}
            <td className="px-4 py-4 whitespace-nowrap">
              <p className="font-bold text-sm text-slate-700">{f.consumo_estimado.toFixed(1)}</p>
              <p className="text-[10px] text-slate-400">uds/día</p>
            </td>

            {/* Días → Crítico */}
            <td className="px-4 py-4 whitespace-nowrap">
              <p className={`font-black text-sm ${
                f.dias_para_nivel_critico === 0 ? 'text-rose-600' :
                f.dias_para_nivel_critico <= 3  ? 'text-orange-500' :
                f.dias_para_nivel_critico <= 7  ? 'text-amber-500' : 'text-emerald-600'
              }`}>
                {diasLabel(f.dias_para_nivel_critico)}
              </p>
            </td>

            {/* Días → Fin */}
            <td className="px-4 py-4 whitespace-nowrap">
              <p className={`font-black text-sm ${f.dias_para_agotarse <= 1 ? 'text-rose-600' : 'text-slate-700'}`}>
                {diasLabel(f.dias_para_agotarse, true)}
              </p>
            </td>

            {/* Impacto familias */}
            <td className="px-4 py-4 whitespace-nowrap">
              <p className="font-black text-sm text-slate-800">{familias}</p>
              <p className="text-[10px] text-slate-400">familias/sem</p>
            </td>

            {/* Acción → botón */}
            <td className="px-4 py-4 whitespace-nowrap">
              <button className={`rounded-lg px-3 py-1.5 text-[11px] font-black transition-colors whitespace-nowrap ${ac.color} ${ac.bg}`}>
                {ac.label}
              </button>
            </td>

            {/* Confianza IA */}
            <td className="px-4 py-4 whitespace-nowrap">
              <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border ${con.pill}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${con.dot}`} />
                {f.confianza_basica}
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function ForecastTable({ forecasts }: { forecasts: ForecastRow[] }) {
  if (!forecasts || forecasts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
        <p className="text-slate-400 font-semibold text-sm">Sin datos de proyección.</p>
      </div>
    );
  }

  const criticos   = forecasts.filter(f => f.estado_forecast === 'critico');
  const atencion   = forecasts.filter(f => f.estado_forecast === 'atencion');
  const estables   = forecasts.filter(f => f.estado_forecast === 'estable');
  const sinDatos   = forecasts.filter(f => f.estado_forecast === 'sin_datos');

  const headers = ['Insumo', 'Estado', 'Stock', 'Cons./día', '→ Crítico', '→ Agotarse', 'Impacto', 'Acción', 'Confianza IA'];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      {/* Cabecera */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60">
        <div>
          <h3 className="font-black text-slate-900 text-sm tracking-tight">Proyección Analítica Continua</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">River ML · Hoeffding Tree — agrupado por urgencia</p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest bg-white border border-slate-100 rounded-full px-3 py-1 text-slate-400">
          {forecasts.length} insumos
        </span>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-white">
              {headers.map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <GroupSection label="Urgencia crítica" icon="🔥" rows={criticos} colorClass="text-rose-600" />
          <GroupSection label="En atención"      icon="⚠️" rows={atencion}  colorClass="text-amber-600" />
          <GroupSection label="Estables"         icon="✅" rows={estables}  colorClass="text-emerald-600" />
          <GroupSection label="Sin datos"        icon="❓" rows={sinDatos}  colorClass="text-slate-400" />
        </table>
      </div>

      {/* Footer leyenda */}
      <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-t border-slate-100 bg-slate-50/40">
        {[
          { icon: '🔥', l: 'Crítico',  c: 'text-rose-500'    },
          { icon: '⚠️', l: 'Atención', c: 'text-amber-500'   },
          { icon: '✅', l: 'Estable',  c: 'text-emerald-500' },
          { icon: '❓', l: 'Sin datos',c: 'text-slate-400'   },
        ].map(x => (
          <div key={x.l} className="flex items-center gap-1">
            <span className="text-sm">{x.icon}</span>
            <span className={`text-[10px] font-semibold ${x.c}`}>{x.l}</span>
          </div>
        ))}
        <span className="ml-auto text-[10px] text-slate-300">Actualizar para reflejar cambios de inventario</span>
      </div>
    </div>
  );
}
