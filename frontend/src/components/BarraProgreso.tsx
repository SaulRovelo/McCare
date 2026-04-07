/**
 * BarraProgreso — Barra horizontal semántica con animación de entrada.
 * value: valor actual (ej: stock_actual)
 * max:   valor máximo (ej: stock máximo o nivel_critico * 2)
 * color: 'urgente' | 'atencion' | 'saludable' | 'acento'
 */

const colorMap = {
  urgente:   'bg-rose-500',
  atencion:  'bg-amber-400',
  saludable: 'bg-emerald-500',
  acento:    'bg-indigo-500',
};

interface Props {
  value: number;           // valor actual
  max: number;             // máximo de la barra
  color?: keyof typeof colorMap;
  animated?: boolean;
  height?: 'thin' | 'normal' | 'thick';
  label?: string;          // opcional — texto encima
}

export default function BarraProgreso({
  value,
  max,
  color = 'saludable',
  animated = true,
  height = 'normal',
  label,
}: Props) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  const h = height === 'thin' ? 'h-1' : height === 'thick' ? 'h-3' : 'h-1.5';

  // Auto-color por porcentaje si no se pasa color
  const autoColor =
    pct <= 20 ? 'urgente' :
    pct <= 50 ? 'atencion' :
    color;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className={`w-full ${h} rounded-full bg-slate-100 overflow-hidden`}>
        <div
          className={`${h} rounded-full ${colorMap[autoColor]} ${animated ? 'anim-bar-fill' : ''}`}
          style={{
            width: animated ? '0%' : `${pct}%`,
            ['--bar-target' as string]: `${pct}%`,
          }}
        />
      </div>
    </div>
  );
}
