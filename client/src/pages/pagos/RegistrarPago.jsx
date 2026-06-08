import { useState, useEffect } from 'react';
import { registrarPago, getFacturas } from '../../api/pagos.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import SelectField from '../../components/SelectField';

export default function RegistrarPago() {
  const [form, setForm] = useState({ factura_id: '', monto: '', usuario: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [facturas, setFacturas] = useState([]);

  useEffect(() => {
    getFacturas({ estado: 'pendiente' })
      .then((res) => {
        const todas = res.data;
        getFacturas({ estado: 'pagada_parcial' }).then((r2) => {
          setFacturas([...todas, ...r2.data]);
          setLoading(false);
        });
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const facturaSeleccionada = facturas.find((f) => f.id === parseInt(form.factura_id, 10));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const res = await registrarPago({
        factura_id: parseInt(form.factura_id, 10),
        monto: parseFloat(form.monto),
        usuario: form.usuario,
      });
      setResult(res);
      setForm({ factura_id: '', monto: '', usuario: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  const inputClass = 'w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Registrar Pago</h2>

      <Alert type="error" message={error} onClose={() => setError(null)} />
      {result && <Alert type="success" message={result.data?.mensaje || 'Pago registrado exitosamente'} />}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 space-y-4">
        <SelectField
          label="Factura"
          value={form.factura_id}
          onChange={(e) => setForm({ ...form, factura_id: e.target.value })}
          options={facturas.map((f) => ({
            value: f.id,
            label: `Factura #${f.id} - ${f.paciente} - Q${parseFloat(f.saldo_pendiente || 0).toFixed(2)} pendiente`,
          }))}
          placeholder="Seleccionar factura..."
          required
        />

        {facturaSeleccionada && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm">
            <p className="text-gray-600 dark:text-gray-300">Total: <span className="font-medium text-gray-900 dark:text-gray-100">Q{parseFloat(facturaSeleccionada.total || 0).toFixed(2)}</span></p>
            <p className="text-gray-600 dark:text-gray-300">Saldo pendiente: <span className="font-medium text-red-600 dark:text-red-400">Q{parseFloat(facturaSeleccionada.saldo_pendiente || 0).toFixed(2)}</span></p>
          </div>
        )}

        <div>
          <label className={labelClass}>Monto (Q)</label>
          <input name="monto" type="number" step="0.01" min="0.01" required value={form.monto}
            onChange={(e) => setForm({ ...form, monto: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Usuario</label>
          <input name="usuario" type="text" required value={form.usuario}
            onChange={(e) => setForm({ ...form, usuario: e.target.value })} className={inputClass} />
        </div>
        <button type="submit" disabled={submitting}
          className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors">
          Registrar pago
        </button>
      </form>
    </div>
  );
}
