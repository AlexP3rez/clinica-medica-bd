import api from './client';

export async function registrarPago({ factura_id, monto, usuario }) {
  const { data } = await api.post('/pagos', { factura_id, monto, usuario });
  return data;
}

export async function getSaldoPaciente(paciente_id) {
  const { data } = await api.get(`/pagos/saldo/${paciente_id}`);
  return data;
}
