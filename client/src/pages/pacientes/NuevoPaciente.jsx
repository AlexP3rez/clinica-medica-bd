import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { crearPaciente, actualizarPaciente, getPacientes } from '../../api/maestros.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

export default function NuevoPaciente() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({ dpi: '', nombres: '', apellidos: '', fecha_nacimiento: '', telefono: '' });
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEditing) return;
    getPacientes().then((res) => {
      const found = res.data.find((p) => p.id === parseInt(id, 10));
      if (found) {
        setForm({
          dpi: found.dpi, nombres: found.nombres, apellidos: found.apellidos,
          fecha_nacimiento: found.fecha_nacimiento ? found.fecha_nacimiento.slice(0, 10) : '',
          telefono: found.telefono || '',
        });
      }
    }).catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = { ...form };
      if (isEditing) {
        await actualizarPaciente(parseInt(id, 10), data);
      } else {
        await crearPaciente(data);
      }
      navigate('/pacientes');
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
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}</h2>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 space-y-4">
        <div>
          <label className={labelClass}>DPI</label>
          <input name="dpi" type="text" required value={form.dpi} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Nombres</label>
          <input name="nombres" type="text" required value={form.nombres} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Apellidos</label>
          <input name="apellidos" type="text" required value={form.apellidos} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Fecha de nacimiento</label>
          <input name="fecha_nacimiento" type="date" required value={form.fecha_nacimiento} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Teléfono</label>
          <input name="telefono" type="text" value={form.telefono} onChange={handleChange} className={inputClass} />
        </div>

        <button type="submit" disabled={submitting}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {isEditing ? 'Guardar cambios' : 'Crear paciente'}
        </button>
      </form>
    </div>
  );
}
