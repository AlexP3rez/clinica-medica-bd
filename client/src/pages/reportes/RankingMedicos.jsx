import { useState, useEffect } from 'react';
import { getRankingMedicos } from '../../api/reportes.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

export default function RankingMedicos() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRankingMedicos()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Ranking Trimestral de Medicos</h2>
      <Alert type="error" message={error} onClose={() => setError(null)} />

      {data && (data.length === 0 ? (
        <EmptyState message="No hay datos de ranking disponibles" />
      ) : (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">#</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Médico</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Especialidad</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Citas</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Facturado</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b dark:border-gray-700 last:border-0">
                  <td className="px-4 py-2.5 text-gray-400 dark:text-gray-500">{i + 1}</td>
                  <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100 font-medium">{row.medico}</td>
                  <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{row.especialidad}</td>
                  <td className="px-4 py-2.5 text-right text-gray-900 dark:text-gray-100">{row.total_citas_atendidas || '-'}</td>
                  <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-medium">Q{parseFloat(row.monto_facturado || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
