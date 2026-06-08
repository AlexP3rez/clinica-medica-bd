import api from './client';

export async function getRankingMedicos() {
  const res = await api.get('/reportes/ranking-medicos');
  return res.data;
}

export async function getFacturacionMensual() {
  const res = await api.get('/reportes/facturacion-mensual');
  return res.data;
}

export async function getTopDiagnosticos(fecha_inicio) {
  const params = fecha_inicio ? { fecha_inicio } : {};
  const res = await api.get('/reportes/top-diagnosticos', { params });
  return res.data;
}

export async function getMedicamentosPorEspecialidad() {
  const res = await api.get('/reportes/medicamentos-por-especialidad');
  return res.data;
}

export async function getAnalisisAvanzado() {
  const res = await api.get('/reportes/analisis-avanzado');
  return res.data;
}

export async function getAgendaDiaria(fecha) {
  const params = fecha ? { fecha } : {};
  const res = await api.get('/reportes/agenda-diaria', { params });
  return res.data;
}

export async function getFacturasPendientesReporte() {
  const res = await api.get('/reportes/facturas-pendientes');
  return res.data;
}
