import api from './client';

export async function crearHistorial(historial) {
  const { data } = await api.post('/historiales', historial);
  return data;
}

export async function getHistorialPorPaciente(paciente_id) {
  const { data } = await api.get(`/historiales/paciente/${paciente_id}`);
  return data;
}
