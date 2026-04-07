'use client';
import { useEffect } from 'react';

/**
 * DonacionCongrats — Modal overlay post-donación.
 * WOW Moment: celebración visual con animación y datos de impacto reales.
 * Se cierra automáticamente en 5 segundos.
 */
interface Props {
  nombre: string;
  familias: number;
  esCritico: boolean;
  hayMasHistorias: boolean;
  onClose: () => void;
}

export default function DonacionCongrats({ nombre, familias, esCritico, hayMasHistorias, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 5500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-emerald-950/96 backdrop-blur-md"
         onClick={onClose}>
      <div className="text-center px-8 max-w-lg" onClick={e => e.stopPropagation()}>

        {/* Emoji celebración */}
        <div className="text-8xl mb-6 anim-celebrate block">
          {hayMasHistorias ? '🎉' : '🕊️'}
        </div>

        {/* Título */}
        <h2 className="text-4xl font-black text-white tracking-tight leading-tight mb-4 anim-slide-bottom">
          {hayMasHistorias
            ? '¡Impacto registrado!'
            : '¡Casa CDMX está protegida esta noche!'}
        </h2>

        {/* Detalle */}
        <div className="space-y-3 anim-fade-in" style={{ animationDelay: '200ms' }}>
          <p className="text-emerald-200 text-xl font-medium leading-relaxed">
            Acabas de asegurar el suministro de{' '}
            <strong className="text-white">{nombre}</strong>.
          </p>

          {familias > 0 && (
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-2xl px-6 py-3 mt-2">
              <span className="text-2xl">👨‍👩‍👧</span>
              <div className="text-left">
                <p className="text-white font-black text-lg leading-none">{familias} familias</p>
                <p className="text-emerald-300 text-xs font-medium">beneficiadas estimadas</p>
              </div>
            </div>
          )}

          <p className="text-emerald-400 text-sm font-medium mt-4">
            El inventario del albergue fue actualizado al instante.
          </p>
        </div>

        {/* Barra de cierre automático */}
        <div className="mt-8 w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full"
            style={{ animation: 'bar-fill 5.5s linear forwards', '--bar-target': '100%' } as React.CSSProperties}
          />
        </div>

        <button onClick={onClose} className="mt-4 text-emerald-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
          Toca para cerrar
        </button>
      </div>
    </div>
  );
}
