/**
 * InsightPanel — 3 alertas automáticas del motor de forecast.
 * Sin lógica de negocio: renderiza mensaje_forecast del backend.
 */
interface ForecastItem {
  nombre: string;
  estado_forecast: 'critico' | 'atencion' | 'estable' | 'sin_datos';
  dias_para_nivel_critico: number;
  mensaje_forecast: string;
}

interface Props {
  forecasts: ForecastItem[];
}

const cfg = {
  critico:  { icon: '🔴', bg: 'bg-rose-50',   border: 'border-rose-200',  text: 'text-rose-700',  badge: 'bg-rose-600 text-white' },
  atencion: { icon: '🟡', bg: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-500 text-white' },
  estable:  { icon: '🟢', bg: 'bg-white',     border: 'border-slate-100', text: 'text-slate-600', badge: 'bg-emerald-100 text-emerald-800' },
  sin_datos:{ icon: '⚪', bg: 'bg-slate-50',  border: 'border-slate-200', text: 'text-slate-500', badge: 'bg-slate-200 text-slate-600' },
};

export default function InsightPanel({ forecasts }: Props) {
  const alertas = forecasts
    .filter(f => f.estado_forecast === 'critico' || f.estado_forecast === 'atencion')
    .slice(0, 3);

  if (alertas.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <span className="text-2xl">✨</span>
        <div>
          <p className="font-bold text-emerald-800 text-sm">Sin alertas activas</p>
          <p className="text-emerald-600 text-xs">Todos los insumos dentro de márgenes seguros.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 stagger">
      {alertas.map((f, i) => {
        const c = cfg[f.estado_forecast];
        const dias = f.dias_para_nivel_critico;
        const tiempo = dias === 0
          ? 'Ahora mismo'
          : dias < 1
          ? `~${Math.round(dias * 24)}h`
          : `${Math.round(dias)} días`;

        return (
          <div key={i} className={`rounded-xl border ${c.bg} ${c.border} p-4 flex items-start gap-3 anim-slide-bottom`}>
            <span className="text-xl shrink-0 mt-0.5">{c.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${c.badge}`}>
                  {tiempo}
                </span>
                <span className="font-black text-slate-900 text-sm">{f.nombre}</span>
              </div>
              <p className={`text-xs font-medium leading-snug ${c.text}`}>{f.mensaje_forecast}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
