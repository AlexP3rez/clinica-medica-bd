import api from './client';

export async function getEspecialidades() {
  const res = await api.get('/especialidades');
  return res.data;
}

export async function getMedicos(especialidad_id) {
  const params = especialidad_id ? { especialidad_id } : {};
  const res = await api.get('/medicos', { params });
  return res.data;
}

export async function getMedicoById(id) {
  const res = await api.get(`/medicos/${id}`);
  return res.data;
}

export async function crearMedico(data) {
  const res = await api.post('/medicos', data);
  return res.data;
}

export async function actualizarMedico(id, data) {
  const res = await api.put(`/medicos/${id}`, data);
  return res.data;
}

export async function getHorariosMedico(id) {
  const res = await api.get(`/medicos/${id}/horarios`);
  return res.data;
}

export async function upsertHorariosMedico(id, horarios) {
  const res = await api.post(`/medicos/${id}/horarios`, horarios);
  return res.data;
}

export async function getPacientes(search) {
  const params = search ? { search } : {};
  const res = await api.get('/pacientes', { params });
  return res.data;
}

export async function crearPaciente(data) {
  const res = await api.post('/pacientes', data);
  return res.data;
}

export async function actualizarPaciente(id, data) {
  const res = await api.put(`/pacientes/${id}`, data);
  return res.data;
}

export async function getServicios() {
  const res = await api.get('/servicios');
  return res.data;
}
