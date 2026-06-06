import { useState } from 'react';
import { getTopDiagnosticos } from '../../api/reportes.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

const inputClass = 'w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

export default function TopDiagnosticos() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setData(null);
    setLoading(true);
    try {
      const res = await getTopDiagnosticos(fechaInicio || undefined);
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Top 5 Diagnosticos por Especialidad</h2>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4 mb-6">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className={labelClass}>Fecha inicio trimestre</label>
            <input type="date" value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)} className={inputClass} />
          </div>
          <button type="submit" disabled={loading}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            Consultar
          </button>
        </div>
      </form>

      {loading && <Loading />}

      {data && (data.length === 0 ? (
        <EmptyState message="No se encontraron diagnosticos" />
      ) : (
        <div className="space-y-4">
          {data.map((item, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">{item.especialidad}</h3>
              <ul className="space-y-1">
                {item.top5?.map((d, j) => (
                  <li key={j} className="flex justify-between text-sm text-gray-700 dark:text-gray-300 py-1 border-b dark:border-gray-700 last:border-0">
                    <span>{d.diagnostico}</span>
                    <span className="text-gray-400 dark:text-gray-500">{d.total} casos</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
