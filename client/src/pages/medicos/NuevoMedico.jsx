import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { crearMedico, actualizarMedico, getMedicoById, getHorariosMedico, upsertHorariosMedico, getEspecialidades } from '../../api/maestros.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import SelectField from '../../components/SelectField';

const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function NuevoMedico() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({ especialidad_id: '', nombres: '', apellidos: '', numero_colegiado: '' });
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [especialidades, setEspecialidades] = useState([]);

  useEffect(() => {
    getEspecialidades().then((res) => setEspecialidades(res.data));
    if (isEditing) {
      Promise.all([getMedicoById(parseInt(id, 10)), getHorariosMedico(parseInt(id, 10))])
        .then(([mRes, hRes]) => {
          const m = mRes.data;
          setForm({ especialidad_id: m.especialidad_id, nombres: m.nombres, apellidos: m.apellidos, numero_colegiado: m.numero_colegiado });
          if (hRes.data.length > 0) {
            setHorarios(hRes.data);
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addHorario = () => {
    setHorarios([...horarios, { dia_semana: 1, hora_inicio: '08:00', hora_fin: '13:00' }]);
  };

  const updateHorario = (idx, field, value) => {
    setHorarios((prev) => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  };

  const removeHorario = (idx) => {
    setHorarios(horarios.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = {
        especialidad_id: parseInt(form.especialidad_id, 10),
        nombres: form.nombres,
        apellidos: form.apellidos,
        numero_colegiado: form.numero_colegiado,
      };

      let medicoRes;
      if (isEditing) {
        medicoRes = await actualizarMedico(parseInt(id, 10), data);
      } else {
        medicoRes = await crearMedico(data);
      }

      const medicoId = medicoRes.data.id;

      if (horarios.length > 0) {
        await upsertHorariosMedico(medicoId, horarios.map((h) => ({
          dia_semana: parseInt(h.dia_semana, 10),
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
        })));
      }

      navigate('/medicos');
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
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{isEditing ? 'Editar Médico' : 'Nuevo Médico'}</h2>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 space-y-4">
        <SelectField
          label="Especialidad"
          value={form.especialidad_id}
          onChange={(e) => setForm({ ...form, especialidad_id: e.target.value })}
          options={especialidades.map((e) => ({ value: e.id, label: e.nombre }))}
          placeholder="Seleccionar especialidad..."
          required
        />

        <div>
          <label className={labelClass}>Nombres</label>
          <input name="nombres" type="text" required value={form.nombres} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Apellidos</label>
          <input name="apellidos" type="text" required value={form.apellidos} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Número de colegiado</label>
          <input name="numero_colegiado" type="text" required value={form.numero_colegiado} onChange={handleChange} className={inputClass} />
        </div>

        <fieldset className="border dark:border-gray-600 rounded-lg p-4">
          <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">Horarios semanales</legend>
          {horarios.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No hay horarios definidos.</p>
          )}
          {horarios.map((h, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-end">
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400 block">Día</label>
                <select value={h.dia_semana} onChange={(e) => updateHorario(idx, 'dia_semana', e.target.value)} className={inputClass}>
                  {DIAS.map((d, i) => i > 0 && <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div className="w-24">
                <label className="text-xs text-gray-500 dark:text-gray-400 block">Inicio</label>
                <input type="time" value={h.hora_inicio} onChange={(e) => updateHorario(idx, 'hora_inicio', e.target.value)} className={inputClass} />
              </div>
              <div className="w-24">
                <label className="text-xs text-gray-500 dark:text-gray-400 block">Fin</label>
                <input type="time" value={h.hora_fin} onChange={(e) => updateHorario(idx, 'hora_fin', e.target.value)} className={inputClass} />
              </div>
              <button type="button" onClick={() => removeHorario(idx)}
                className="text-red-500 hover:text-red-700 pb-2">X</button>
            </div>
          ))}
          <button type="button" onClick={addHorario}
            className="text-sm text-blue-600 hover:text-blue-700 mt-2">+ Agregar horario</button>
        </fieldset>

        <button type="submit" disabled={submitting}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {isEditing ? 'Guardar cambios' : 'Crear médico'}
        </button>
      </form>
    </div>
  );
}
