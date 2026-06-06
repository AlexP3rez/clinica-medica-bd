import { useState, useEffect } from 'react';
import { getAnalisisAvanzado } from '../../api/reportes.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

export default function AnalisisAvanzado() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAnalisisAvanzado()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const signos = data?.signosVitalesPorEdad || [];
  const tiempos = data?.tiempoEntreConsultas || [];

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Analisis Avanzado</h2>
      <Alert type="error" message={error} onClose={() => setError(null)} />

      {!data ? null : (
        <>
          {/* Signos vitales por grupo etario */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Signos Vitales por Grupo Etario</h3>
            {signos.length === 0 ? (
              <EmptyState message="No hay datos de signos vitales" />
            ) : (
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Grupo</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Presion Sistolica (prom)</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Frec. Cardiaca (prom)</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Pacientes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signos.map((row, i) => (
                      <tr key={i} className="border-b dark:border-gray-700 last:border-0">
                        <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100 font-medium">{row._id || row.grupoEtario}</td>
                        <td className="px-4 py-2.5 text-right text-gray-900 dark:text-gray-100">
                          {parseFloat(row.promedioPresionSistolica || 0).toFixed(1)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-900 dark:text-gray-100">
                          {parseFloat(row.promedioFrecuenciaCardiaca || 0).toFixed(1)} lpm
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-500 dark:text-gray-400">{row.totalPacientes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tiempos entre consultas */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Tiempo Promedio Entre Consultas</h3>
            {tiempos.length === 0 ? (
              <EmptyState message="No hay datos de tiempos entre consultas" />
            ) : (
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Paciente ID</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Total Consultas</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Intervalo Promedio (dias)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiempos.map((row, i) => (
                      <tr key={i} className="border-b dark:border-gray-700 last:border-0">
                        <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100">{row.paciente_id}</td>
                        <td className="px-4 py-2.5 text-right text-gray-900 dark:text-gray-100">{row.totalConsultas}</td>
                        <td className="px-4 py-2.5 text-right text-gray-900 dark:text-gray-100">
                          {parseFloat(row.intervaloPromedioDias || 0).toFixed(1)} dias
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
