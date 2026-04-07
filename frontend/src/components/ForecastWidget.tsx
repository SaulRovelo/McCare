import React from 'react';

export default function ForecastWidget({ forecasts }: { forecasts: any[] }) {
  if (!forecasts || forecasts.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🔮</span>
        <div>
          <h3 className="font-extrabold text-slate-800 text-[17px] tracking-tight leading-none">CareForecast (Proyección)</h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Análisis Histórico a 30 días</p>
        </div>
      </div>

      <div className="space-y-4">
        {forecasts.map((f: any, idx) => {
           let indicatorClass = "bg-emerald-50 text-emerald-800 border-emerald-100";
           let timeBadge = "bg-emerald-100 text-emerald-800";
           
           if (f.estado_forecast === "critico") {
             indicatorClass = "bg-rose-50 text-rose-800 border-rose-100";
             timeBadge = "bg-rose-500 text-white shadow-sm";
           } else if (f.estado_forecast === "atencion") {
             indicatorClass = "bg-amber-50 text-amber-800 border-amber-100";
             timeBadge = "bg-amber-400 text-amber-900 shadow-sm";
           } else if (f.estado_forecast === "sin_datos") {
             indicatorClass = "bg-slate-50 text-slate-600 border-slate-200 border-dashed";
             timeBadge = "bg-slate-200 text-slate-500";
           }
           
           return (
             <div key={idx} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all hover:shadow-md ${indicatorClass}`}>
                <div className="flex-1">
                  <h4 className="font-bold tracking-tight text-sm mb-1 line-clamp-1">{f.nombre}</h4>
                  <p className="text-xs font-semibold opacity-80 leading-snug">{f.mensaje_forecast}</p>
                  {f.confianza_basica === "baja" && <span className="inline-block mt-2 px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-widest bg-white/50 border border-current opacity-70">Confianza Baja</span>}
                </div>
                
                <div className="shrink-0 text-center flex flex-col items-center">
                   <div className={`px-4 py-2 rounded-xl flex flex-col items-center ${timeBadge}`}>
                     <span className="text-xl font-black leading-none">{f.dias_para_nivel_critico}</span>
                     <span className="text-[9px] font-bold uppercase tracking-widest opacity-90 mt-0.5 mt-1">días</span>
                   </div>
                </div>
             </div>
           );
        })}
      </div>
    </div>
  );
}
