import { useState, useEffect } from 'react';
import { getAgendaDiaria } from '../../api/reportes.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

export default function AgendaDiaria() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    setLoading(true);
    getAgendaDiaria(fecha)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [fecha]);

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Agenda Diaria</h2>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
      </div>

      {loading ? <Loading /> : (
        data && (data.length === 0 ? (
          <EmptyState message={`No hay citas para el ${fecha}`} />
        ) : (
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Hora</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Paciente</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Médico</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Especialidad</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c.cita_id} className="border-b dark:border-gray-700 last:border-0">
                    <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100 font-mono">{c.hora ? c.hora.slice(0, 5) : '-'}</td>
                    <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100">{c.paciente}</td>
                    <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{c.medico}</td>
                    <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{c.especialidad}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        c.estado === 'atendida' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        c.estado === 'programada' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                        c.estado === 'cancelada' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>{c.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
