import api from './client';

export async function crearCita({ paciente_id, medico_id, fecha, hora }) {
  const { data } = await api.post('/citas', { paciente_id, medico_id, fecha, hora });
  return data;
}

export async function cancelarCita(id, motivo, usuario) {
  const { data } = await api.put(`/citas/${id}/cancelar`, { motivo, usuario });
  return data;
}

export async function getHorariosLibres(medico_id, fecha) {
  const { data } = await api.get('/citas/horarios-libres', { params: { medico_id, fecha } });
  return data;
}
