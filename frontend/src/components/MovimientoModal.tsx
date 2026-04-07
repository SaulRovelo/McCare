'use client';
import { useState } from 'react';
import { postMovimiento } from '@/services/api';

interface Props {
  insumos: any[];
  onSuccess: () => void;
  onClose: () => void;
}

export default function MovimientoModal({ insumos, onSuccess, onClose }: Props) {
  const [form, setForm] = useState({
    insumo_id: insumos[0]?.id || '',
    tipo_movimiento: 'entrada' as 'entrada' | 'salida' | 'ajuste',
    cantidad: 1,
    observacion: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const insumoSeleccionado = insumos.find(i => i.id === form.insumo_id);

  // Stock resultante estimado
  const stockResultante = (() => {
    if (!insumoSeleccionado) return null;
    const s = insumoSeleccionado.stock_actual;
    if (form.tipo_movimiento === 'entrada') return s + form.cantidad;
    if (form.tipo_movimiento === 'salida') return s - form.cantidad;
    if (form.tipo_movimiento === 'ajuste') return form.cantidad;
    return s;
  })();

  const stockValido = stockResultante !== null && stockResultante >= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockValido) { setError('El movimiento dejaría el stock negativo.'); return; }
    setSaving(true);
    setError('');
    try {
      await postMovimiento({ ...form, origen: 'interno' });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el movimiento.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";
  const labelClass = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2";

  const tipoColors: Record<string, string> = {
    entrada: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    salida:  'text-rose-700 bg-rose-50 border-rose-200',
    ajuste:  'text-amber-700 bg-amber-50 border-amber-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
         onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-white font-black text-xl tracking-tight">Registrar Movimiento</h2>
            <p className="text-slate-400 text-xs font-medium mt-0.5">Entrada · Salida · Ajuste de inventario</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Insumo */}
          <div>
            <label className={labelClass}>Insumo</label>
            <select
              className={inputClass}
              value={form.insumo_id}
              onChange={e => setForm(f => ({ ...f, insumo_id: e.target.value }))}
            >
              {insumos.map(i => (
                <option key={i.id} value={i.id}>
                  {i.nombre} — stock: {i.stock_actual}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className={labelClass}>Tipo de Movimiento</label>
            <div className="grid grid-cols-3 gap-2">
              {(['entrada', 'salida', 'ajuste'] as const).map(tipo => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, tipo_movimiento: tipo }))}
                  className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                    form.tipo_movimiento === tipo
                      ? tipoColors[tipo]
                      : 'text-slate-400 bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <label className={labelClass}>Cantidad</label>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={form.cantidad}
              onChange={e => setForm(f => ({ ...f, cantidad: Math.max(1, parseInt(e.target.value) || 1) }))}
            />
          </div>

          {/* Observación */}
          <div>
            <label className={labelClass}>Observación <span className="normal-case text-slate-300">(opcional)</span></label>
            <input
              type="text"
              placeholder="Motivo del movimiento..."
              className={inputClass}
              value={form.observacion}
              onChange={e => setForm(f => ({ ...f, observacion: e.target.value }))}
            />
          </div>

          {/* Preview del resultado */}
          {insumoSeleccionado && (
            <div className={`rounded-xl p-4 text-sm font-semibold border ${stockValido ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
              Stock actual: <span className="font-black">{insumoSeleccionado.stock_actual}</span>
              {' → '}
              Stock resultante: <span className={`font-black ${stockValido ? 'text-slate-900' : 'text-rose-700'}`}>{stockResultante}</span>
              {!stockValido && <span className="ml-2">⚠️ Stock insuficiente</span>}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={saving || !stockValido}
              className={`flex-1 py-3 rounded-xl font-black text-sm transition-all
                ${saving || !stockValido
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5'}`}>
              {saving ? 'Guardando...' : 'Confirmar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
