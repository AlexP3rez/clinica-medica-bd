import { useState, useEffect } from 'react';
import { getSaldoPaciente } from '../../api/pagos.api';
import { getPacientes } from '../../api/maestros.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import SelectField from '../../components/SelectField';

export default function SaldoPaciente() {
  const [pacienteId, setPacienteId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    getPacientes()
      .then((res) => setPacientes(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setData(null);
    setSubmitting(true);
    try {
      const res = await getSaldoPaciente(parseInt(pacienteId, 10));
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Saldo del Paciente</h2>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 space-y-4 mb-6">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <SelectField
              label="Paciente"
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
              options={pacientes.map((p) => ({
                value: p.id,
                label: `${p.nombres} ${p.apellidos} (DPI: ${p.dpi})`,
              }))}
              placeholder="Seleccionar paciente..."
              required
            />
          </div>
          <button type="submit" disabled={submitting || !pacienteId}
            className="bg-blue-600 text-white py-2.5 px-6 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors h-[42px]">
            Consultar
          </button>
        </div>
      </form>

      {submitting && <Loading />}

      {data && (
        data.length === 0 ? (
          <EmptyState message="Paciente no encontrado o sin facturas pendientes" />
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
                    <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100">#{row.factura_id}</td>
                    <td className="px-4 py-2.5 text-right text-gray-900 dark:text-gray-100">Q{parseFloat(row.total_factura || 0).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-900 dark:text-gray-100">Q{parseFloat(row.total_pagado || 0).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={parseFloat(row.saldo_pendiente || 0) > 0 ? 'text-red-600 dark:text-red-400 font-medium' : 'text-green-600 dark:text-green-400 font-medium'}>
                        Q{parseFloat(row.saldo_pendiente || 0).toFixed(2)}
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
