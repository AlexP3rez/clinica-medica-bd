import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMedicos } from '../../api/maestros.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

export default function Medicos() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMedicos()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Médicos</h2>
        <Link to="/medicos/nuevo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + Nuevo médico
        </Link>
      </div>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      {data.length === 0 ? (
        <EmptyState message="No hay médicos registrados" />
      ) : (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Especialidad</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Colegiado</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Acción</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m) => (
                <tr key={m.id} className="border-b dark:border-gray-700 last:border-0">
                  <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100 font-medium">{m.nombres} {m.apellidos}</td>
                  <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{m.especialidad}</td>
                  <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{m.numero_colegiado}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Link to={`/medicos/${m.id}/editar`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium">Editar</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
