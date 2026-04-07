/**
 * KpiStrip — Fila compacta de 6 chips para el header del Admin.
 * Sin cards grandes — chips inline de máxima densidad.
 */
interface Props {
  resumen: {
    insumos_criticos:        number;
    insumos_atencion:        number;
    insumos_estables:        number;
    misiones_activas:        number;
    cobertura_promedio_dias: number;
    porcentaje_catalogo_sano:number;
    movimientos_recientes:   number;
  } | null;
}

const chip = (
  icon: string,
  label: string,
  value: string | number,
  color: string,
  pulse = false
) => (
  <div key={label}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${color}`}>
    <span>{icon}</span>
    <span className={`font-black text-sm ${pulse ? 'animate-pulse' : ''}`}>{value}</span>
    <span className="hidden sm:inline text-[10px] font-medium opacity-70 uppercase tracking-wide">{label}</span>
  </div>
);

export default function KpiStrip({ resumen }: Props) {
  if (!resumen) return (
    <div className="flex gap-2">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="h-8 w-20 bg-slate-100 rounded-lg animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="flex flex-wrap gap-2">
      {chip('🔥', 'Críticos', resumen.insumos_criticos,
        resumen.insumos_criticos > 0
          ? 'bg-rose-50 border-rose-200 text-rose-700'
          : 'bg-slate-50 border-slate-200 text-slate-500',
        resumen.insumos_criticos > 0)}
      {chip('⚠️', 'Atención', resumen.insumos_atencion,
        resumen.insumos_atencion > 0
          ? 'bg-amber-50 border-amber-200 text-amber-700'
          : 'bg-slate-50 border-slate-200 text-slate-500')}
      {chip('✓', 'Estables', resumen.insumos_estables,
        'bg-emerald-50 border-emerald-200 text-emerald-700')}
      {chip('🚨', 'Misiones', resumen.misiones_activas,
        resumen.misiones_activas > 0
          ? 'bg-rose-50 border-rose-200 text-rose-700'
          : 'bg-slate-50 border-slate-200 text-slate-400',
        resumen.misiones_activas > 0)}
      {chip('📅', 'Cobertura', `${resumen.cobertura_promedio_dias}d`,
        'bg-indigo-50 border-indigo-200 text-indigo-700')}
      {chip('✅', 'Sano', `${resumen.porcentaje_catalogo_sano}%`,
        'bg-slate-50 border-slate-200 text-slate-600')}
      {chip('📋', 'Hoy', resumen.movimientos_recientes,
        'bg-slate-50 border-slate-200 text-slate-600')}
    </div>
  );
}
