/**
 * SemaforoChip — Badge semántico por estado de forecast/misión.
 * Reutilizable en Admin, Corporativo y Donante.
 */
type Estado = 'critico' | 'atencion' | 'estable' | 'sin_datos' | 'optimo';

const configs: Record<Estado, { bg: string; text: string; dot: string; label: string; pulse: boolean }> = {
  critico:   { bg: 'bg-rose-100',    text: 'text-rose-700',    dot: 'bg-rose-500',    label: 'Crítico',    pulse: true  },
  atencion:  { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500',   label: 'Atención',   pulse: false },
  estable:   { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Estable',    pulse: false },
  optimo:    { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Óptimo',     pulse: false },
  sin_datos: { bg: 'bg-slate-100',   text: 'text-slate-500',   dot: 'bg-slate-400',   label: 'Sin datos',  pulse: false },
};

interface Props {
  estado: Estado;
  label?: string;
  count?: number;
  size?: 'sm' | 'md';
}

export default function SemaforoChip({ estado, label, count, size = 'md' }: Props) {
  const c = configs[estado] ?? configs.sin_datos;
  const text = label ?? c.label;
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-lg ${pad} ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot} ${c.pulse ? 'animate-pulse' : ''}`} />
      {text}
      {count !== undefined && (
        <span className="font-black">{count}</span>
      )}
    </span>
  );
}
