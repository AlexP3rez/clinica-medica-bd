import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHistorialPorPaciente } from '../../api/historiales.api';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

const inputClass = 'flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

export default function HistorialPaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState(id || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(!!id);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setData(null);
    setLoading(true);
    try {
      const res = await getHistorialPorPaciente(parseInt(searchId, 10));
      setData(res.data);
      if (searchId !== id) navigate(`/historiales/paciente/${searchId}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Historial del Paciente</h2>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4 mb-6">
        <div>
          <label className={labelClass}>Paciente ID</label>
          <div className="flex gap-2">
            <input type="number" min="1" required value={searchId}
              onChange={(e) => setSearchId(e.target.value)} className={inputClass} />
            <button type="submit" disabled={loading}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              Buscar
            </button>
          </div>
        </div>
      </form>

      {loading && <Loading />}

      {searched && data && (
        data.length === 0 ? (
          <EmptyState message="No se encontraron historiales para este paciente" />
        ) : (
          <div className="space-y-4">
            {data.map((hist, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">{hist.especialidad}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(hist.fecha_consulta).toLocaleDateString('es-ES', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </span>
                </div>

                {hist.datos_base && (
                  <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                    <p className="text-gray-600 dark:text-gray-300 mb-1">
                      <strong>Motivo:</strong> {hist.datos_base.motivo_consulta}
                    </p>
                    {hist.datos_base.signos_vitales && (
                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <span>PA: {hist.datos_base.signos_vitales.presion_arterial_sistolica}/{hist.datos_base.signos_vitales.presion_arterial_diastolica}</span>
                        <span>FC: {hist.datos_base.signos_vitales.frecuencia_cardiaca} lpm</span>
                        <span>Temp: {hist.datos_base.signos_vitales.temperatura}°C</span>
                        <span>Peso: {hist.datos_base.signos_vitales.peso_kg} kg</span>
                      </div>
                    )}
                  </div>
                )}

                {hist.diagnosticos?.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Diagnosticos</span>
                    <ul className="mt-1 space-y-1">
                      {hist.diagnosticos.map((d, j) => (
                        <li key={j} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs px-1.5 py-0.5 rounded font-mono">{d.codigo_cie10}</span>
                          {d.descripcion}
                          <span className="text-xs text-gray-400 dark:text-gray-500">({d.tipo})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {hist.medicamentos_recetados?.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Medicamentos</span>
                    <ul className="mt-1 space-y-1">
                      {hist.medicamentos_recetados.map((m, j) => (
                        <li key={j} className="text-sm text-gray-700 dark:text-gray-300">
                          {m.nombre} — {m.dosis}, {m.frecuencia}, {m.duracion_dias} dias
                        </li>
                      ))}
                    </ul>
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
