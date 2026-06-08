import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPacientes } from '../../api/maestros.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

export default function Pacientes() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPacientes()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Pacientes</h2>
        <Link to="/pacientes/nuevo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + Nuevo paciente
        </Link>
      </div>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      {data.length === 0 ? (
        <EmptyState message="No hay pacientes registrados" />
      ) : (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">DPI</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Teléfono</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Acción</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id} className="border-b dark:border-gray-700 last:border-0">
                  <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100 font-medium">{p.nombres} {p.apellidos}</td>
                  <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{p.dpi}</td>
                  <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{p.telefono || '-'}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Link to={`/pacientes/${p.id}/editar`}
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
