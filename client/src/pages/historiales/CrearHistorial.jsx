import { useState, useEffect } from 'react';
import { crearHistorial } from '../../api/historiales.api';
import { getCitas } from '../../api/citas.api';
import { getPacientes, getMedicos, getEspecialidades } from '../../api/maestros.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import SelectField from '../../components/SelectField';

const ESPECIALIDADES_LIST = ['Cardiologia', 'Pediatria', 'Dermatologia', 'Ginecologia', 'Medicina General'];

export default function CrearHistorial() {
  const [form, setForm] = useState({
    cita_id: '', paciente_id: '', medico_id: '', especialidad: '',
    fecha_consulta: '', fecha_nacimiento_paciente: '',
    datos_base: {
      motivo_consulta: '',
      signos_vitales: { presion_arterial_sistolica: '', presion_arterial_diastolica: '', frecuencia_cardiaca: '', temperatura: '', peso_kg: '' },
      notas_adicionales: '',
    },
    diagnosticos: [{ codigo_cie10: '', descripcion: '', tipo: 'Presuntivo' }],
    medicamentos_recetados: [{ nombre: '', dosis: '', frecuencia: '', duracion_dias: '' }],
    examenes_solicitados: [''],
    datos_especificos_especialidad: {},
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);

  useEffect(() => {
    Promise.all([
      getCitas({ estado: 'atendida' }),
      getPacientes(),
      getMedicos(),
    ]).then(([cRes, pRes, mRes]) => {
      setCitas(cRes.data);
      setPacientes(pRes.data);
      setMedicos(mRes.data);
    }).catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateForm = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const setNested = (path, value) => {
    setForm((f) => {
      const keys = path.split('.');
      const obj = { ...f };
      let current = obj;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return obj;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const body = {
        ...form,
        cita_id: parseInt(form.cita_id, 10),
        paciente_id: parseInt(form.paciente_id, 10),
        medico_id: parseInt(form.medico_id, 10),
      };
      const res = await crearHistorial(body);
      setResult(res);
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
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Nuevo Historial Clínico</h2>

      <Alert type="error" message={error} onClose={() => setError(null)} />
      {result && <Alert type="success" message={`Historial creado exitosamente (ID: ${result.data?._id || 'N/A'})`} />}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 space-y-4">
        <SelectField label="Cita" value={form.cita_id}
          onChange={(e) => updateForm('cita_id', e.target.value)}
          options={citas.map((c) => ({ value: c.id, label: `#${c.id} - ${c.paciente} - ${c.medico} - ${c.fecha} ${c.hora}` }))}
          placeholder="Seleccionar cita atendida..." required />

        <SelectField label="Paciente" value={form.paciente_id}
          onChange={(e) => updateForm('paciente_id', e.target.value)}
          options={pacientes.map((p) => ({ value: p.id, label: `${p.nombres} ${p.apellidos} (DPI: ${p.dpi})` }))}
          placeholder="Seleccionar paciente..." required />

        <SelectField label="Médico" value={form.medico_id}
          onChange={(e) => updateForm('medico_id', e.target.value)}
          options={medicos.map((m) => ({ value: m.id, label: `${m.nombres} ${m.apellidos} (${m.especialidad})` }))}
          placeholder="Seleccionar médico..." required />

        <SelectField label="Especialidad" value={form.especialidad}
          onChange={(e) => updateForm('especialidad', e.target.value)}
          options={ESPECIALIDADES_LIST.map((e) => ({ value: e, label: e }))}
          placeholder="Seleccionar especialidad..." required />

        <div>
          <label className={labelClass}>Fecha de consulta</label>
          <input type="datetime-local" required value={form.fecha_consulta}
            onChange={(e) => updateForm('fecha_consulta', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Fecha de nacimiento del paciente</label>
          <input type="date" required value={form.fecha_nacimiento_paciente}
            onChange={(e) => updateForm('fecha_nacimiento_paciente', e.target.value)} className={inputClass} />
        </div>

        <fieldset className="border dark:border-gray-600 rounded-lg p-4">
          <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">Datos base</legend>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Motivo de consulta</label>
              <input type="text" required value={form.datos_base.motivo_consulta}
                onChange={(e) => setNested('datos_base.motivo_consulta', e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Signos vitales</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(form.datos_base.signos_vitales).map(([key, val]) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">
                      {key.replace(/_/g, ' ')}
                    </label>
                    <input type="number" step={key === 'temperatura' || key === 'peso_kg' ? '0.1' : '1'} required
                      value={val} onChange={(e) => setNested(`datos_base.signos_vitales.${key}`, e.target.value)}
                      className={inputClass} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Notas adicionales</label>
              <textarea rows="2" value={form.datos_base.notas_adicionales}
                onChange={(e) => setNested('datos_base.notas_adicionales', e.target.value)} className={inputClass} />
            </div>
          </div>
        </fieldset>

        <div>
          <label className={labelClass}>Diagnósticos</label>
          {form.diagnosticos.map((d, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input placeholder="Código CIE10" value={d.codigo_cie10}
                onChange={(e) => {
                  const arr = [...form.diagnosticos];
                  arr[i] = { ...arr[i], codigo_cie10: e.target.value };
                  updateForm('diagnosticos', arr);
                }} className={`${inputClass} flex-1`} />
              <input placeholder="Descripción" value={d.descripcion}
                onChange={(e) => {
                  const arr = [...form.diagnosticos];
                  arr[i] = { ...arr[i], descripcion: e.target.value };
                  updateForm('diagnosticos', arr);
                }} className={`${inputClass} flex-1`} />
              <select value={d.tipo}
                onChange={(e) => {
                  const arr = [...form.diagnosticos];
                  arr[i] = { ...arr[i], tipo: e.target.value };
                  updateForm('diagnosticos', arr);
                }} className={inputClass} style={{ width: '140px' }}>
                <option>Presuntivo</option>
                <option>Definitivo</option>
              </select>
              <button type="button" onClick={() => updateForm('diagnosticos', form.diagnosticos.filter((_, idx) => idx !== i))}
                className="text-red-500 hover:text-red-700 px-2">X</button>
            </div>
          ))}
          <button type="button" onClick={() => updateForm('diagnosticos', [...form.diagnosticos, { codigo_cie10: '', descripcion: '', tipo: 'Presuntivo' }])}
            className="text-sm text-blue-600 hover:text-blue-700 mt-1">+ Agregar diagnóstico</button>
        </div>

        <div>
          <label className={labelClass}>Exámenes solicitados</label>
          {form.examenes_solicitados.map((ex, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input placeholder="Nombre del examen" value={ex}
                onChange={(e) => {
                  const arr = [...form.examenes_solicitados];
                  arr[i] = e.target.value;
                  updateForm('examenes_solicitados', arr);
                }} className={inputClass} />
              <button type="button" onClick={() => updateForm('examenes_solicitados', form.examenes_solicitados.filter((_, idx) => idx !== i))}
                className="text-red-500 hover:text-red-700 px-2">X</button>
            </div>
          ))}
          <button type="button" onClick={() => updateForm('examenes_solicitados', [...form.examenes_solicitados, ''])}
            className="text-sm text-blue-600 hover:text-blue-700 mt-1">+ Agregar examen</button>
        </div>

        <button type="submit" disabled={submitting}
          className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors">
          Crear historial
        </button>
      </form>
    </div>
  );
}
