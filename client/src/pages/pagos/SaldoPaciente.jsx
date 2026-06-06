import { useState } from 'react';
import { getSaldoPaciente } from '../../api/pagos.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

export default function SaldoPaciente() {
  const [pacienteId, setPacienteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setData(null);
    setLoading(true);
    try {
      const res = await getSaldoPaciente(parseInt(pacienteId, 10));
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Saldo del Paciente</h2>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 space-y-4 mb-6">
        <div>
          <label className={labelClass}>Paciente ID</label>
          <div className="flex gap-2">
            <input type="number" min="1" required value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)} className={inputClass} />
            <button type="submit" disabled={loading}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              Consultar
            </button>
          </div>
        </div>
      </form>

      {loading && <Loading />}

      {data && (
        data.length === 0 ? (
          <EmptyState message="Paciente no encontrado o sin facturas" />
        ) : (
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Factura ID</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Total</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Pagado</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-b dark:border-gray-700 last:border-0">
                    <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100">{row.factura_id}</td>
                    <td className="px-4 py-2.5 text-right text-gray-900 dark:text-gray-100">${parseFloat(row.total || 0).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-900 dark:text-gray-100">${parseFloat(row.pagado || 0).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={parseFloat(row.saldo || 0) > 0 ? 'text-red-600 dark:text-red-400 font-medium' : 'text-green-600 dark:text-green-400 font-medium'}>
                        ${parseFloat(row.saldo || 0).toFixed(2)}
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
