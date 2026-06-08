import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHistorialPorPaciente } from '../../api/historiales.api';
import { getPacientes } from '../../api/maestros.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import SelectField from '../../components/SelectField';

export default function HistorialPaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pacienteId, setPacienteId] = useState(id || '');
  const [searchId, setSearchId] = useState(id || '');
  const [inicial, setInicial] = useState(!!id);
  const [loading, setLoading] = useState(!!id);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    getPacientes()
      .then((res) => setPacientes(res.data))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (id && inicial) {
      getHistorialPorPaciente(parseInt(id, 10))
        .then((res) => {
          setData(res.data);
          setPacienteId(id);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, inicial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchId) {
      setLoading(true);
      setError(null);
      setData(null);
      setInicial(false);
      navigate(`/historiales/paciente/${searchId}`, { replace: true });
      getHistorialPorPaciente(parseInt(searchId, 10))
        .then((res) => {
          setData(res.data);
          setPacienteId(searchId);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  };

  if (loading && inicial) return <Loading />;

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Historial del Paciente</h2>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 space-y-4 mb-6">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <SelectField
              label="Paciente"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              options={pacientes.map((p) => ({
                value: p.id,
                label: `${p.nombres} ${p.apellidos} (DPI: ${p.dpi})`,
              }))}
              placeholder="Seleccionar paciente..."
              required
            />
          </div>
          <button type="submit" disabled={!searchId}
            className="bg-blue-600 text-white py-2.5 px-6 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors h-[42px]">
            Buscar
          </button>
        </div>
      </form>

      {loading && !inicial && <Loading />}

      {data && (
        data.length === 0 ? (
          <EmptyState message={`No se encontraron historiales para el paciente #${pacienteId}`} />
        ) : (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {data.length} consulta(s) encontrada(s) para paciente #{pacienteId}
            </h3>
            {data.map((row, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.especialidad}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(row.fecha_consulta).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {row.datos_base && (
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-3">
                    <p><span className="font-medium">Motivo:</span> {row.datos_base.motivo_consulta}</p>
                    {row.datos_base.signos_vitales && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Presión: {row.datos_base.signos_vitales.presion_arterial_sistolica}/{row.datos_base.signos_vitales.presion_arterial_diastolica} | FC: {row.datos_base.signos_vitales.frecuencia_cardiaca} | Temp: {row.datos_base.signos_vitales.temperatura}°C | Peso: {row.datos_base.signos_vitales.peso_kg}kg
                      </p>
                    )}
                  </div>
                )}
                {row.diagnosticos && row.diagnosticos.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Diagnósticos:</span>
                    {row.diagnosticos.map((d, j) => (
                      <span key={j} className="ml-2 inline-block px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded text-xs">{d.descripcion}</span>
                    ))}
                  </div>
                )}
                {row.medicamentos_recetados && row.medicamentos_recetados.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Medicamentos:</span>
                    {row.medicamentos_recetados.map((m, j) => (
                      <span key={j} className="ml-2 inline-block px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-xs">{m.nombre} ({m.dosis})</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
