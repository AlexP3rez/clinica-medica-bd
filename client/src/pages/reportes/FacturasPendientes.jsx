import { useState, useEffect } from 'react';
import { getFacturasPendientesReporte } from '../../api/reportes.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

export default function FacturasPendientes() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getFacturasPendientesReporte()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Facturas Pendientes</h2>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      {data && (data.length === 0 ? (
        <EmptyState message="No hay facturas pendientes" />
      ) : (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Factura #</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Paciente</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Total</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Saldo</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Días</th>
              </tr>
            </thead>
            <tbody>
              {data.map((f) => (
                <tr key={f.factura_id} className="border-b dark:border-gray-700 last:border-0">
                  <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100">#{f.factura_id}</td>
                  <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100">{f.paciente}</td>
                  <td className="px-4 py-2.5 text-right text-gray-900 dark:text-gray-100">Q{parseFloat(f.total_factura || 0).toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-red-600 dark:text-red-400 font-medium">Q{parseFloat(f.saldo_pendiente || 0).toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-gray-500 dark:text-gray-400">{f.dias_antiguedad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
