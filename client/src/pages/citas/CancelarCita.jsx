import { useState } from 'react';
import { cancelarCita } from '../../api/citas.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

export default function CancelarCita() {
  const [form, setForm] = useState({ id: '', motivo: '', usuario: '' });
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
      const res = await cancelarCita(parseInt(form.id, 10), form.motivo, form.usuario);
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
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Cancelar Cita</h2>

      <Alert type="error" message={error} onClose={() => setError(null)} />
      {result && <Alert type="success" message="Cita cancelada exitosamente" />}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 space-y-4">
        <div>
          <label className={labelClass}>Cita ID</label>
          <input name="id" type="number" min="1" required value={form.id} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Motivo</label>
          <input name="motivo" type="text" required value={form.motivo} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Usuario</label>
          <input name="usuario" type="text" required value={form.usuario} onChange={handleChange} className={inputClass} />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
          Cancelar cita
        </button>
      </form>
    </div>
  );
}
