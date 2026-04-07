import React from 'react';

// Tipado mínimo de interfaz para el componente
type Insumo = {
  id: string;
  nombre: string;
  categoria: string;
  stock_actual: number;
  consumo_diario: number;
  nivel_critico: number;
};

export default function InsumoTable({ insumos }: { insumos: Insumo[] }) {
  if (insumos.length === 0) return <p className="text-gray-500">No hay insumos registrados todavía.</p>;

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
      <table className="min-w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3">Nombre</th>
            <th className="px-6 py-3">Categoría</th>
            <th className="px-6 py-3 text-center">Stock Actual</th>
            <th className="px-6 py-3 text-center">Consumo Diario</th>
            <th className="px-6 py-3 text-center">Nivel Crítico</th>
          </tr>
        </thead>
        <tbody>
          {insumos.map((i) => (
            <tr key={i.id} className="border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{i.nombre}</td>
              <td className="px-6 py-4">{i.categoria}</td>
              <td className="px-6 py-4 text-center font-semibold text-blue-600">{i.stock_actual}</td>
              <td className="px-6 py-4 text-center">{i.consumo_diario}</td>
              <td className="px-6 py-4 text-center text-red-500">{i.nivel_critico}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
