import { useState, useEffect } from 'react';
import { getMedicamentosPorEspecialidad } from '../../api/reportes.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

export default function MedicamentosEspecialidad() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMedicamentosPorEspecialidad()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const grouped = {};
  if (data) {
    data.forEach((item) => {
      if (!grouped[item.especialidad]) grouped[item.especialidad] = [];
      grouped[item.especialidad].push(item);
    });
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Medicamentos por Especialidad</h2>
      <Alert type="error" message={error} onClose={() => setError(null)} />

      {data && (data.length === 0 ? (
        <EmptyState message="No se encontraron datos" />
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([especialidad, items]) => (
            <div key={especialidad} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">{especialidad}</h3>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Medicamento</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Total</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">%</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, j) => (
                    <tr key={j} className="border-t dark:border-gray-700">
                      <td className="px-3 py-1.5 text-gray-700 dark:text-gray-300">{item.medicamento}</td>
                      <td className="px-3 py-1.5 text-right text-gray-700 dark:text-gray-300">{item.total}</td>
                      <td className="px-3 py-1.5 text-right text-gray-500 dark:text-gray-400">
                        {parseFloat(item.porcentaje || 0).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
