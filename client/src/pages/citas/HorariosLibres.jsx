import { useState, useEffect } from 'react';
import { getHorariosLibres } from '../../api/citas.api';
import { getMedicos } from '../../api/maestros.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import SelectField from '../../components/SelectField';

export default function HorariosLibres() {
  const [form, setForm] = useState({ medico_id: '', fecha: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [medicos, setMedicos] = useState([]);

  useEffect(() => {
    getMedicos()
      .then((res) => setMedicos(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setData(null);
    setSubmitting(true);
    try {
      const res = await getHorariosLibres(parseInt(form.medico_id, 10), form.fecha);
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  const inputClass = 'w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Horarios Libres</h2>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 space-y-4 mb-6">
        <SelectField
          label="Médico"
          value={form.medico_id}
          onChange={(e) => setForm({ ...form, medico_id: e.target.value })}
          options={medicos.map((m) => ({
            value: m.id,
            label: `${m.nombres} ${m.apellidos} (${m.especialidad})`,
          }))}
          placeholder="Seleccionar médico..."
          required
        />

        <div>
          <label className={labelClass}>Fecha</label>
          <input type="date" required value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })} className={inputClass} />
        </div>
        <button type="submit" disabled={submitting}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          Consultar
        </button>
      </form>

      {submitting && <Loading />}

      {data && (
        data.length === 0 ? (
          <Alert type="info" message="No hay horarios libres para este médico en la fecha seleccionada" />
        ) : (
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Horarios disponibles:</h3>
            <div className="flex flex-wrap gap-2">
              {data.map((slot, i) => (
                <span key={i} className="inline-block px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-sm font-medium">
                  {slot.hora_libre ? slot.hora_libre.slice(0, 5) : JSON.stringify(slot)}
                </span>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
