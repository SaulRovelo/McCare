import React from 'react';

export default function HistorialTimeline({ movimientos, insumosMap }: { movimientos: any[], insumosMap: Record<string, string> }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col">
      <h3 className="font-extrabold text-slate-800 text-[17px] tracking-tight mb-8">⏱️ Registro Analítico Reciente</h3>
      
      {movimientos.length === 0 ? (
        <p className="text-slate-400 text-sm italic font-medium">Bóveda central inactiva actualmente.</p>
      ) : (
        <div className="flex-1 pr-2 space-y-7 relative">
          {movimientos.map((m: any, idx) => {
            const dateStr = new Date(m.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
            const insumoNombre = insumosMap[m.insumo_id] || "Activo Logístico";
            
            // Iconografía puramente Ejecutiva
            let color = "bg-slate-100";
            let dot = "bg-slate-400";
            let lbl = "Ajuste";
            let amount = m.cantidad;
            
            if (m.tipo_movimiento === "entrada") { 
                color = "bg-emerald-50 border-emerald-100"; 
                dot = "bg-emerald-500";
                lbl = "Ingreso";
                amount = `+${m.cantidad}`;
            } else if (m.tipo_movimiento === "salida") { 
                color = "bg-rose-50 border-rose-100"; 
                dot = "bg-rose-500";
                lbl = "Salida";
                amount = `-${m.cantidad}`;
            }

            return (
              <div key={m.id} className="flex gap-4 relative">
                {idx !== movimientos.length - 1 && <div className="absolute left-[3px] top-4 w-[2px] h-[calc(100%+8px)] bg-slate-100"></div>}
                
                <div className={`mt-1.5 z-10 w-2 h-2 rounded-full ring-4 ring-white ${dot}`}></div>
                
                <div className={`flex-1 border p-3 rounded-2xl ${color}`}>
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-slate-800 tracking-tight leading-none mb-1">
                      {lbl} • <span className="font-black text-slate-900">{amount}</span>
                    </p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dateStr}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">{insumoNombre}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
