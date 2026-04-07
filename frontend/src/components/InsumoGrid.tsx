import React from 'react';
import InsumoCard from './InsumoCard';

export default function InsumoGrid({ insumos }: { insumos: any[] }) {
  if (!insumos || insumos.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {insumos.map((i: any) => (
        <InsumoCard key={i.id} insumo={i} />
      ))}
    </div>
  );
}
