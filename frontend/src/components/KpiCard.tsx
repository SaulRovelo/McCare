import React from 'react';

export default function KpiCard({ title, value, subtitle, icon, valueColor = "text-slate-800" }: any) {
  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</h3>
      </div>
      <div>
        <p className={`text-4xl font-black tracking-tight ${valueColor}`}>{value}</p>
        <p className="text-sm text-slate-500 mt-1 font-medium">{subtitle}</p>
      </div>
    </div>
  );
}
