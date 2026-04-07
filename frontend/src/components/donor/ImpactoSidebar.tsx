'use client';
import { useState, useEffect } from 'react';

/**
 * ImpactoSidebar — Panel sticky del portal donante.
 * Gamificación via localStorage + contador de donantes simulado.
 * Sin lógica de negocio — solo UI feedback.
 */

const STORAGE_MISIONES  = 'mccare_misiones';
const STORAGE_FAMILIAS  = 'mccare_familias';

function getStored(key: string, fallback: number): number {
  if (typeof window === 'undefined') return fallback;
  return parseInt(localStorage.getItem(key) ?? String(fallback));
}

export function useSesionImpacto() {
  const [misiones, setMisiones]   = useState(0);
  const [familias, setFamilias]   = useState(0);
  const [iniciado, setIniciado]   = useState(false);

  useEffect(() => {
    setMisiones(getStored(STORAGE_MISIONES, 0));
    setFamilias(getStored(STORAGE_FAMILIAS, 0));
    setIniciado(true);
  }, []);

  const registrarDonacion = (familiasNuevas: number) => {
    setMisiones(prev => {
      const n = prev + 1;
      localStorage.setItem(STORAGE_MISIONES, String(n));
      return n;
    });
    setFamilias(prev => {
      const n = prev + familiasNuevas;
      localStorage.setItem(STORAGE_FAMILIAS, String(n));
      return n;
    });
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_MISIONES);
    localStorage.removeItem(STORAGE_FAMILIAS);
    setMisiones(0); setFamilias(0);
  };

  return { misiones, familias, registrarDonacion, reset, iniciado };
}

// Número simulado de donantes activos (8–15, estable por sesión)
function useDonantesSimulados() {
  const [n, setN] = useState(12);
  useEffect(() => {
    setN(Math.floor(Math.random() * 8) + 8); // 8-15
  }, []);
  return n;
}

interface Props {
  misiones: number;
  familias: number;
  categoriaActiva: string;
  categorias: string[];
  historias: any[];
  onCategoria: (cat: string) => void;
}

export default function ImpactoSidebar({ misiones, familias, categoriaActiva, categorias, historias, onCategoria }: Props) {
  const donantesActivos = useDonantesSimulados();
  const pct = misiones > 0 ? Math.min(100, misiones * 25) : 0; // cada misión = 25%

  return (
    <aside className="space-y-4 sticky top-20 self-start">

      {/* Panel Tu Impacto */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Tu impacto hoy</h3>

        {misiones === 0 ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">💙</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Aún no has donado esta sesión.</p>
            <p className="text-slate-400 text-xs mt-1">Tu primera donación aparecerá aquí.</p>
          </div>
        ) : (
          <>
            {/* Anillo de progreso SVG */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke="#6366f1" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * pct) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-indigo-600">{misiones}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">misiones</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Familias ayudadas</span>
                <span className="font-black text-emerald-600">{familias}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Misiones</span>
                <span className="font-black text-indigo-600">{misiones}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Donantes activos */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">En este momento</span>
        </div>
        <p className="text-3xl font-black text-slate-900">{donantesActivos}</p>
        <p className="text-xs font-medium text-slate-500 mt-0.5">donantes activos</p>
      </div>

      {/* Filtro por categoría */}
      {categorias.length > 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Apoyar por área</h3>
          <div className="space-y-1">
            {categorias.map(cat => {
              const count = cat === 'Todas'
                ? historias.length
                : historias.filter((h: any) => h.categoria === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => onCategoria(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold transition-all
                    ${categoriaActiva === cat
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <span>{cat}</span>
                  {count > 0 && (
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded
                      ${categoriaActiva === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
