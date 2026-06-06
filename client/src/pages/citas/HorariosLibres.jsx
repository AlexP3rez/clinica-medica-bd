import { useState } from 'react';
import { getHorariosLibres } from '../../api/citas.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

export default function HorariosLibres() {
  const [form, setForm] = useState({ medico_id: '', fecha: '' });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setData(null);
    setLoading(true);
    try {
      const res = await getHorariosLibres(parseInt(form.medico_id, 10), form.fecha);
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Horarios Libres</h2>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Medico ID</label>
            <input name="medico_id" type="number" min="1" required value={form.medico_id} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Fecha</label>
            <input name="fecha" type="date" required value={form.fecha} onChange={handleChange} className={inputClass} />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="bg-blue-600 text-white py-2.5 px-6 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          Consultar
        </button>
      </form>

      {loading && <Loading />}

      {data && (
        data.length === 0 ? (
          <EmptyState message="No hay horarios libres para esta fecha" />
        ) : (
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Hora</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Disponible</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-b dark:border-gray-700 last:border-0">
                    <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100">{row.hora}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        row.disponible ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                      }`}>
                        {row.disponible ? 'Libre' : 'Ocupado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
