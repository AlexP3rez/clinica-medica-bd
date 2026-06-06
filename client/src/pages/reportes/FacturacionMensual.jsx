import { useState, useEffect } from 'react';
import { getFacturacionMensual } from '../../api/reportes.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

export default function FacturacionMensual() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getFacturacionMensual()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Facturacion Mensual</h2>
      <Alert type="error" message={error} onClose={() => setError(null)} />

      {data && (data.length === 0 ? (
        <EmptyState message="No hay datos de facturacion disponibles" />
      ) : (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Mes</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Total Facturado</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Total Pagado</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Pendiente</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b dark:border-gray-700 last:border-0">
                  <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100 font-medium">{row.mes || '-'}</td>
                  <td className="px-4 py-2.5 text-right text-gray-900 dark:text-gray-100">
                    ${parseFloat(row.total_facturado || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2.5 text-right text-green-700 dark:text-green-400">
                    ${parseFloat(row.total_pagado || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2.5 text-right text-red-600 dark:text-red-400">
                    ${parseFloat(row.pendiente || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
