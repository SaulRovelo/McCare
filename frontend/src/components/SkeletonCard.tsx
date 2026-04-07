/**
 * SkeletonCard — Placeholder animado durante loading.
 * Evita pantallas en blanco — experiencia de carga premium.
 */
interface Props {
  lines?: number;
  hasButton?: boolean;
  compact?: boolean;
}

function SkeletonLine({ width = 'w-full', height = 'h-4' }: { width?: string; height?: string }) {
  return <div className={`${width} ${height} bg-slate-200 rounded-lg animate-pulse`} />;
}

export default function SkeletonCard({ lines = 3, hasButton = true, compact = false }: Props) {
  const pad = compact ? 'p-4' : 'p-5';
  return (
    <div className={`${pad} rounded-xl bg-white border border-slate-200 space-y-3`}>
      <div className="flex items-center gap-2">
        <SkeletonLine width="w-16" height="h-5" />
        <SkeletonLine width="w-24" height="h-4" />
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={i === lines - 1 ? 'w-3/4' : 'w-full'} />
      ))}
      {hasButton && (
        <div className="flex justify-end pt-1">
          <SkeletonLine width="w-28" height="h-9" />
        </div>
      )}
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="py-16 flex flex-col items-center gap-5 animate-pulse">
      <div className="h-5 w-32 bg-rose-200 rounded-full" />
      <div className="h-16 w-80 bg-slate-200 rounded-2xl" />
      <div className="h-5 w-64 bg-slate-100 rounded-full" />
      <div className="h-5 w-48 bg-slate-100 rounded-full" />
    </div>
  );
}
