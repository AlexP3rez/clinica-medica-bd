import api from './client';

export async function getFacturas(params) {
  const res = await api.get('/facturas', { params });
  return res.data;
}

export async function crearFactura(data) {
  const res = await api.post('/facturas', data);
  return res.data;
}

export async function registrarPago(data) {
  const res = await api.post('/pagos', data);
  return res.data;
}

export async function getSaldoPaciente(paciente_id) {
  const res = await api.get(`/pagos/saldo/${paciente_id}`);
  return res.data;
}
