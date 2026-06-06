import { useState } from 'react';
import { crearCita } from '../../api/citas.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

export default function CrearCita() {
  const [form, setForm] = useState({ paciente_id: '', medico_id: '', fecha: '', hora: '' });
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
      const res = await crearCita({
        paciente_id: parseInt(form.paciente_id, 10),
        medico_id: parseInt(form.medico_id, 10),
        fecha: form.fecha,
        hora: form.hora,
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
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Nueva Cita</h2>

      <Alert type="error" message={error} onClose={() => setError(null)} />
      {result && (
        <Alert type="success" message={`Cita creada exitosamente (ID: ${result.data?.id || 'N/A'})`} />
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 space-y-4">
        <div>
          <label className={labelClass}>Paciente ID</label>
          <input name="paciente_id" type="number" min="1" required value={form.paciente_id} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Medico ID</label>
          <input name="medico_id" type="number" min="1" required value={form.medico_id} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Fecha</label>
          <input name="fecha" type="date" required value={form.fecha} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Hora (HH:MM)</label>
          <input name="hora" type="time" required value={form.hora} onChange={handleChange} className={inputClass} />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          Crear cita
        </button>
      </form>
    </div>
  );
}
