import { useState } from 'react';
import { registrarPago } from '../../api/pagos.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

export default function RegistrarPago() {
  const [form, setForm] = useState({ factura_id: '', monto: '', usuario: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await registrarPago({
        factura_id: parseInt(form.factura_id, 10),
        monto: parseFloat(form.monto),
        usuario: form.usuario,
      });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const inputClass = 'w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Registrar Pago</h2>

      <Alert type="error" message={error} onClose={() => setError(null)} />
      {result && <Alert type="success" message={`Pago registrado exitosamente (Factura #${form.factura_id})`} />}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 space-y-4">
        <div>
          <label className={labelClass}>Factura ID</label>
          <input name="factura_id" type="number" min="1" required value={form.factura_id} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Monto</label>
          <input name="monto" type="number" step="0.01" min="0.01" required value={form.monto} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Usuario</label>
          <input name="usuario" type="text" required value={form.usuario} onChange={handleChange} className={inputClass} />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors">
          Registrar pago
        </button>
      </form>
    </div>
  );
}
