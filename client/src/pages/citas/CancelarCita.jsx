import { useState, useEffect } from 'react';
import { cancelarCita, getCitas } from '../../api/citas.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import SelectField from '../../components/SelectField';

export default function CancelarCita() {
  const [form, setForm] = useState({ cita_id: '', motivo: '', usuario: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [citas, setCitas] = useState([]);

  useEffect(() => {
    getCitas({ estado: 'programada' })
      .then((res) => {
        const todas = res.data;
        getCitas({ estado: 'confirmada' }).then((r2) => {
          setCitas([...todas, ...r2.data]);
          setLoading(false);
        });
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const res = await cancelarCita(parseInt(form.cita_id, 10), form.motivo, form.usuario);
      setResult(res);
      setForm({ cita_id: '', motivo: '', usuario: '' });
      setCitas((prev) => prev.filter((c) => c.id !== parseInt(form.cita_id, 10)));
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
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Cancelar Cita</h2>

      <Alert type="error" message={error} onClose={() => setError(null)} />
      {result && <Alert type="success" message={result.data?.mensaje || 'Cita cancelada exitosamente'} />}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 space-y-4">
        <SelectField
          label="Cita a cancelar"
          value={form.cita_id}
          onChange={(e) => setForm({ ...form, cita_id: e.target.value })}
          options={citas.map((c) => ({
            value: c.id,
            label: `#${c.id} - ${c.paciente} con ${c.medico} - ${c.fecha} ${c.hora}`,
          }))}
          placeholder="Seleccionar cita..."
          required
        />

        <div>
          <label className={labelClass}>Motivo de cancelación</label>
          <input name="motivo" type="text" required value={form.motivo}
            onChange={(e) => setForm({ ...form, motivo: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Usuario</label>
          <input name="usuario" type="text" required value={form.usuario}
            onChange={(e) => setForm({ ...form, usuario: e.target.value })} className={inputClass} />
        </div>
        <button type="submit" disabled={submitting}
          className="w-full bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
          Cancelar cita
        </button>
      </form>
    </div>
  );
}
