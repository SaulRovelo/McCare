import React from 'react';

export default function InsumoCard({ insumo }: { insumo: any }) {
  const safeLevel = insumo.nivel_critico * 2.5;
  const fillPercent = Math.min(100, (insumo.stock_actual / safeLevel) * 100);

  let statusColor = "bg-emerald-500";
  let statusBg = "bg-emerald-50";
  let statusText = "text-emerald-700";
  
  if (insumo.stock_actual <= insumo.nivel_critico) {
    statusColor = "bg-rose-500";
    statusBg = "bg-rose-50";
    statusText = "text-rose-700";
  } else if (insumo.stock_actual <= insumo.nivel_critico * 1.5) {
    statusColor = "bg-amber-400";
    statusBg = "bg-amber-50";
    statusText = "text-amber-700";
  }

  return (
    <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
      <div className="flex justify-between items-start mb-5">
        <div>
           <h4 className="font-extrabold text-slate-800 text-lg leading-tight tracking-tight mb-1">{insumo.nombre}</h4>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">{insumo.categoria}</span>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-end mb-2">
           <span className="text-3xl font-black text-slate-800 tracking-tighter">{insumo.stock_actual}</span>
           <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${statusBg} ${statusText}`}>
             Mín: {insumo.nivel_critico}
           </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
           <div className={`h-full ${statusColor} rounded-full transition-all duration-1000`} style={{ width: `${fillPercent}%` }}></div>
        </div>
      </div>
    </div>
  );
}
