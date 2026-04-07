'use client';
import { useEffect, useState } from 'react';

/**
 * useCountUp — Contador animado sin dependencias externas.
 * target: número final. duration: ms de la animación.
 */
export function useCountUp(target: number, duration = 1200): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [target, duration]);

  return count;
}

/**
 * HeroImpacto — WOW moment del portal donante.
 * El número de familias se anima de 0 al target.
 * Todos los textos provienen del backend — sin lógica aquí.
 */
interface Props {
  resumen: {
    mensaje_hero_emocional: string;
    familias_en_riesgo: number;
    urgencias_criticas: number;
    prevenciones_activas: number;
    total_historias: number;
    tagline: string;
  };
  onScrollToMisiones: () => void;
}

export default function HeroImpacto({ resumen, onScrollToMisiones }: Props) {
  const animatedCount = useCountUp(resumen.familias_en_riesgo, 1400);
  const hasCriticas = resumen.urgencias_criticas > 0;

  // Extraer el número del mensaje para separar el renderizado animado
  // El backend entrega: "Hoy puedes cambiar la noche de 65 niños"
  // Separamos en partes para animar solo el número
  const parts = resumen.mensaje_hero_emocional.split(/(\d+)/);

  return (
    <section className={`relative overflow-hidden border-b ${hasCriticas ? 'bg-gradient-to-br from-rose-950 via-rose-900 to-slate-900' : 'bg-gradient-to-br from-[#1e1b4b] via-indigo-900 to-slate-900'}`}>

      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10 blur-3xl ${hasCriticas ? 'bg-rose-400' : 'bg-indigo-400'}`} />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10 blur-3xl bg-violet-400" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24 text-center">

        {/* Tagline */}
        <p className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">
          McCare | {resumen.tagline}
        </p>

        {/* Badge de estado urgente */}
        {hasCriticas && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600/80 border border-rose-500/50 text-white text-xs font-black uppercase tracking-widest mb-6 anim-slide-top">
            <span className="w-2 h-2 rounded-full bg-white animate-ping inline-block" />
            Intervención requerida esta noche
          </div>
        )}

        {/* Mensaje hero con número animado */}
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight mb-6 anim-count-up">
          {resumen.familias_en_riesgo > 0 ? (
            <>
              {parts.map((part, i) =>
                /^\d+$/.test(part) ? (
                  <span key={i} className={`${hasCriticas ? 'text-rose-300' : 'text-indigo-300'} tabular-nums`}>
                    {animatedCount}
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </>
          ) : (
            resumen.mensaje_hero_emocional
          )}
        </h1>

        {/* Contadores rápidos */}
        {resumen.total_historias > 0 && (
          <div className="flex items-center justify-center gap-6 mb-10 anim-fade-in" style={{ animationDelay: '400ms' }}>
            {resumen.urgencias_criticas > 0 && (
              <div className="text-center">
                <p className="text-3xl font-black text-rose-300">{resumen.urgencias_criticas}</p>
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mt-0.5">críticas</p>
              </div>
            )}
            {resumen.urgencias_criticas > 0 && resumen.prevenciones_activas > 0 && (
              <div className="w-px h-10 bg-white/20" />
            )}
            {resumen.prevenciones_activas > 0 && (
              <div className="text-center">
                <p className="text-3xl font-black text-amber-300">{resumen.prevenciones_activas}</p>
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mt-0.5">preventivas</p>
              </div>
            )}
          </div>
        )}

        {/* CTA Principal */}
        <button
          onClick={onScrollToMisiones}
          className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-base shadow-2xl transition-all hover:-translate-y-1 anim-slide-bottom
            ${hasCriticas
              ? 'bg-rose-500 text-white hover:bg-rose-400 shadow-rose-900/50'
              : 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-indigo-900/50'}`}
          style={{ animationDelay: '600ms' }}
        >
          {hasCriticas ? '🚨 Ver urgencias activas' : '❤️ Ver formas de ayudar'}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </section>
  );
}
