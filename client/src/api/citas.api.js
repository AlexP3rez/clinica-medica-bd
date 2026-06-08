import api from './client';

export async function getCitas(params) {
  const res = await api.get('/citas', { params });
  return res.data;
}

export async function getCitaById(id) {
  const res = await api.get(`/citas/${id}`);
  return res.data;
}

export async function crearCita(data) {
  const res = await api.post('/citas', data);
  return res.data;
}

export async function cancelarCita(id, motivo, usuario) {
  const res = await api.put(`/citas/${id}/cancelar`, { motivo, usuario });
  return res.data;
}

export async function cambiarEstadoCita(id, estado, usuario) {
  const res = await api.put(`/citas/${id}/estado`, { estado, usuario });
  return res.data;
}

export async function getHorariosLibres(medico_id, fecha) {
  const res = await api.get('/citas/horarios-libres', { params: { medico_id, fecha } });
  return res.data;
}
