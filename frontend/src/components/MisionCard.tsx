import React, { useState } from 'react';

type Mision = {
  id: string;
  insumo_id: string;
  nombre_insumo: string;
  nivel_urgencia: number;
  mensaje: string;
};

export default function MisionCard({ mision, onResolver }: { mision: Mision, onResolver: (id: string) => Promise<void> }) {
  const [isResolving, setIsResolving] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Regla unificada: El backend sólo manda misiones cuando stock_actual <= nivel_critico (Crítico absoluto)
  let cardClass = 'bg-rose-600 shadow-rose-200 shadow-xl text-white border border-transparent';
  let badgeClass = 'bg-white text-rose-800 shadow-sm';
  let tagText = 'Misión Crítica Activa';

  let cantidadAislada = '';
  let restoMensaje = mision.mensaje;
  const match = mision.mensaje.match(/requieren (\d+) unidades/);
  
  if (match) {
    cantidadAislada = `${match[1]} UNIDADES`;
    restoMensaje = `de ${mision.nombre_insumo.toLowerCase()} necesarias para los próximos días.`;
  } else {
    cantidadAislada = "ACCIÓN VITAL";
    restoMensaje = `La demanda superó el stock mínimo seguro.`;
  }

  const handleResolverClick = async () => {
    setIsResolving(true);
    await onResolver(mision.insumo_id);
    setIsDone(true);
  };

  return (
    <div className={`w-full rounded-3xl p-8 transition-all duration-700 transform ${isDone ? 'scale-95 opacity-0 h-0 p-0 mb-0 overflow-hidden' : 'scale-100 opacity-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden'} ${cardClass}`}>
      <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-64 h-64"><path d="M12 2L1 21h22L12 2z"/></svg>
      </div>
      
      <div className="flex-1 z-10 w-full text-left">
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${badgeClass}`}>
            {tagText}
          </span>
        </div>
        
        <h3 className="font-extrabold text-3xl capitalize tracking-tight leading-none mb-2">{mision.nombre_insumo}</h3>
        <span className="block text-5xl font-black mb-2 opacity-90 tracking-tighter">{cantidadAislada}</span>
        <span className="block text-[15px] font-medium opacity-80 leading-snug max-w-lg">
          {restoMensaje}
        </span>
      </div>
      
      <div className="z-10 w-full md:w-auto shrink-0 mt-4 md:mt-0">
          <button 
            onClick={handleResolverClick}
            disabled={isResolving || isDone}
            className={`w-full md:w-auto whitespace-nowrap text-lg font-black py-4 px-10 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-1
              ${isResolving ? 'bg-white/20 text-white cursor-not-allowed' : 'bg-white text-slate-900'}`}
          >
            {isResolving ? (
              <>⏳ Apoyando...</>
            ) : (
              '⚡ Resolver Misión'
            )}
          </button>
      </div>
    </div>
  );
}
