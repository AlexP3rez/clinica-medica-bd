import { useState } from 'react';
import { crearHistorial } from '../../api/historiales.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

const ESPECIALIDADES = ['Cardiologia', 'Pediatria', 'Dermatologia', 'Ginecologia', 'Medicina General'];

const INITIAL = {
  cita_id: '',
  paciente_id: '',
  medico_id: '',
  especialidad: '',
  fecha_consulta: '',
  fecha_nacimiento_paciente: '',
  datos_base: {
    motivo_consulta: '',
    signos_vitales: {
      presion_arterial_sistolica: '',
      presion_arterial_diastolica: '',
      frecuencia_cardiaca: '',
      temperatura: '',
      peso_kg: '',
    },
    notas_adicionales: '',
  },
  diagnosticos: [{ codigo_cie10: '', descripcion: '', tipo: 'Presuntivo' }],
  medicamentos_recetados: [],
  examenes_solicitados: [''],
};

const inputClass = 'w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';
const labelClass = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1';
const fieldsetClass = 'border dark:border-gray-700 rounded-lg p-4';

export default function CrearHistorial() {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const setNested = (path, value) => {
    setForm((prev) => {
      const keys = path.split('.');
      const copy = JSON.parse(JSON.stringify(prev));
      let obj = copy;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const body = {
        cita_id: parseInt(form.cita_id, 10),
        paciente_id: parseInt(form.paciente_id, 10),
        medico_id: parseInt(form.medico_id, 10),
        especialidad: form.especialidad,
        fecha_consulta: form.fecha_consulta,
        fecha_nacimiento_paciente: form.fecha_nacimiento_paciente || null,
        datos_base: {
          motivo_consulta: form.datos_base.motivo_consulta,
          signos_vitales: {
            presion_arterial_sistolica: parseInt(form.datos_base.signos_vitales.presion_arterial_sistolica, 10),
            presion_arterial_diastolica: parseInt(form.datos_base.signos_vitales.presion_arterial_diastolica, 10),
            frecuencia_cardiaca: parseInt(form.datos_base.signos_vitales.frecuencia_cardiaca, 10),
            temperatura: parseFloat(form.datos_base.signos_vitales.temperatura),
            peso_kg: parseFloat(form.datos_base.signos_vitales.peso_kg),
          },
          notas_adicionales: form.datos_base.notas_adicionales || '',
        },
        diagnosticos: form.diagnosticos.filter((d) => d.descripcion),
        medicamentos_recetados: form.medicamentos_recetados,
        examenes_solicitados: form.examenes_solicitados.filter(Boolean),
        datos_especificos_especialidad: {},
      };
      const res = await crearHistorial(body);
      setResult(res);
      setForm(INITIAL);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Nuevo Historial Clinico</h2>

      <Alert type="error" message={error} onClose={() => setError(null)} />
      {result && <Alert type="success" message={`Historial creado exitosamente (ID: ${result.data?._id || 'N/A'})`} />}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 space-y-6">
        {/* Datos basicos */}
        <fieldset className={fieldsetClass}>
          <legend className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2">Datos Basicos</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <div>
              <label className={labelClass}>Cita ID</label>
              <input type="number" min="1" required value={form.cita_id} onChange={(e) => setForm({ ...form, cita_id: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Paciente ID</label>
              <input type="number" min="1" required value={form.paciente_id} onChange={(e) => setForm({ ...form, paciente_id: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Medico ID</label>
              <input type="number" min="1" required value={form.medico_id} onChange={(e) => setForm({ ...form, medico_id: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Especialidad</label>
              <select required value={form.especialidad} onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
                className={`${inputClass} bg-white dark:bg-gray-700`}>
                <option value="">Seleccionar...</option>
                {ESPECIALIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Fecha Consulta</label>
              <input type="datetime-local" required value={form.fecha_consulta} onChange={(e) => setForm({ ...form, fecha_consulta: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fecha Nac. Paciente</label>
              <input type="date" value={form.fecha_nacimiento_paciente} onChange={(e) => setForm({ ...form, fecha_nacimiento_paciente: e.target.value })} className={inputClass} />
            </div>
          </div>
        </fieldset>

        {/* Motivo y signos vitales */}
        <fieldset className={fieldsetClass}>
          <legend className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2">Motivo y Signos Vitales</legend>
          <div className="space-y-3 mt-2">
            <div>
              <label className={labelClass}>Motivo Consulta</label>
              <input type="text" required value={form.datos_base.motivo_consulta}
                onChange={(e) => setNested('datos_base.motivo_consulta', e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                ['presion_arterial_sistolica', 'Presion Sistolica'],
                ['presion_arterial_diastolica', 'Presion Diastolica'],
                ['frecuencia_cardiaca', 'Frec. Cardiaca'],
                ['temperatura', 'Temperatura (°C)'],
                ['peso_kg', 'Peso (kg)'],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  <input type="number" step={key === 'temperatura' || key === 'peso_kg' ? '0.1' : '1'} required
                    value={form.datos_base.signos_vitales[key]}
                    onChange={(e) => setNested(`datos_base.signos_vitales.${key}`, e.target.value)} className={inputClass} />
                </div>
              ))}
            </div>
            <div>
              <label className={labelClass}>Notas Adicionales</label>
              <textarea rows={2} value={form.datos_base.notas_adicionales}
                onChange={(e) => setNested('datos_base.notas_adicionales', e.target.value)} className={inputClass} />
            </div>
          </div>
        </fieldset>

        {/* Diagnosticos */}
        <fieldset className={fieldsetClass}>
          <legend className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2">Diagnosticos</legend>
          <div className="space-y-2 mt-2">
            {form.diagnosticos.map((d, i) => (
              <div key={i} className="flex gap-2">
                <input placeholder="Codigo CIE10" value={d.codigo_cie10}
                  onChange={(e) => { const copy = [...form.diagnosticos]; copy[i] = { ...copy[i], codigo_cie10: e.target.value }; setForm({ ...form, diagnosticos: copy }); }}
                  className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                <input placeholder="Descripcion" value={d.descripcion}
                  onChange={(e) => { const copy = [...form.diagnosticos]; copy[i] = { ...copy[i], descripcion: e.target.value }; setForm({ ...form, diagnosticos: copy }); }}
                  className="flex-[2] border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                <select value={d.tipo}
                  onChange={(e) => { const copy = [...form.diagnosticos]; copy[i] = { ...copy[i], tipo: e.target.value }; setForm({ ...form, diagnosticos: copy }); }}
                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 outline-none">
                  <option>Presuntivo</option>
                  <option>Definitivo</option>
                </select>
                {form.diagnosticos.length > 1 && (
                  <button type="button" onClick={() => setForm({ ...form, diagnosticos: form.diagnosticos.filter((_, idx) => idx !== i) })}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm px-2">X</button>
                )}
              </div>
            ))}
            <button type="button"
              onClick={() => setForm({ ...form, diagnosticos: [...form.diagnosticos, { codigo_cie10: '', descripcion: '', tipo: 'Presuntivo' }] })}
              className="text-blue-600 dark:text-blue-400 text-sm hover:text-blue-800 dark:hover:text-blue-300 font-medium">
              + Agregar diagnostico
            </button>
          </div>
        </fieldset>

        {/* Examenes */}
        <fieldset className={fieldsetClass}>
          <legend className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2">Examenes Solicitados</legend>
          <div className="space-y-2 mt-2">
            {form.examenes_solicitados.map((ex, i) => (
              <div key={i} className="flex gap-2">
                <input placeholder="Nombre del examen" value={ex}
                  onChange={(e) => { const copy = [...form.examenes_solicitados]; copy[i] = e.target.value; setForm({ ...form, examenes_solicitados: copy }); }}
                  className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                {form.examenes_solicitados.length > 1 && (
                  <button type="button" onClick={() => setForm({ ...form, examenes_solicitados: form.examenes_solicitados.filter((_, idx) => idx !== i) })}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm px-2">X</button>
                )}
              </div>
            ))}
            <button type="button"
              onClick={() => setForm({ ...form, examenes_solicitados: [...form.examenes_solicitados, ''] })}
              className="text-blue-600 dark:text-blue-400 text-sm hover:text-blue-800 dark:hover:text-blue-300 font-medium">
              + Agregar examen
            </button>
          </div>
        </fieldset>

        <button type="submit" disabled={loading}
          className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors">
          Crear historial clinico
        </button>
      </form>
    </div>
  );
}
