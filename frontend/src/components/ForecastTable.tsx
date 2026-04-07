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

const estadoConfig = {
  critico:   { bg: 'bg-rose-50',   border: 'border-rose-200',  badge: 'bg-rose-600 text-white',           label: 'CRÍTICO' },
  atencion:  { bg: 'bg-amber-50',  border: 'border-amber-200', badge: 'bg-amber-500 text-white',           label: 'ATENCIÓN' },
  estable:   { bg: 'bg-white',     border: 'border-slate-100', badge: 'bg-emerald-100 text-emerald-800',   label: 'ESTABLE' },
  sin_datos: { bg: 'bg-slate-50',  border: 'border-slate-200', badge: 'bg-slate-200 text-slate-600',       label: 'SIN DATOS' },
};

const confianzaColor = { alta: 'text-emerald-600', media: 'text-amber-500', baja: 'text-slate-400' };

export default function ForecastTable({ forecasts }: { forecasts: ForecastRow[] }) {
  if (!forecasts || forecasts.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center">
        <p className="text-slate-400 font-semibold">Sin datos de forecast. Ejecuta la simulación de historial.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-black text-slate-900 tracking-tight">Proyección Analítica Continua</h3>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Motor: River ML / Hoeffding Trees</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Insumo', 'Cat.', 'Estado', 'Stock', 'Nivel Crítico', 'Consumo/día', 'Días → Crítico', 'Días → Agotarse', 'Método', 'Confianza'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {forecasts.map((f, i) => {
              const cfg = estadoConfig[f.estado_forecast];
              return (
                <tr key={i} className={`border-b border-slate-50 hover:${cfg.bg} transition-colors`}>
                  <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">{f.nombre}</td>
                  <td className="px-4 py-3 text-slate-500">{f.categoria}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${cfg.badge}`}>{cfg.label}</span>
                  </td>
                  <td className={`px-4 py-3 font-bold ${f.stock_actual <= f.nivel_critico ? 'text-rose-600' : 'text-slate-800'}`}>
                    {f.stock_actual}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{f.nivel_critico}</td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{f.consumo_estimado}</td>
                  <td className="px-4 py-3">
                    <span className={`font-black ${f.dias_para_nivel_critico === 0 ? 'text-rose-600' : f.dias_para_nivel_critico <= 7 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {f.dias_para_nivel_critico === 0 ? '≤ 0' : f.dias_para_nivel_critico}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{f.dias_para_agotarse}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${f.metodo_usado === 'fallback_base' ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-700'}`}>
                      {f.metodo_usado === 'fallback_base' ? 'fallback' : 'River ML'}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-bold ${confianzaColor[f.confianza_basica]}`}>{f.confianza_basica}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
