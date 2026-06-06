import api from './client';

export async function getRankingMedicos() {
  const { data } = await api.get('/reportes/ranking-medicos');
  return data;
}

export async function getFacturacionMensual() {
  const { data } = await api.get('/reportes/facturacion-mensual');
  return data;
}

export async function getTopDiagnosticos(fecha_inicio) {
  const { data } = await api.get('/reportes/top-diagnosticos', {
    params: fecha_inicio ? { fecha_inicio } : {},
  });
  return data;
}

export async function getMedicamentosPorEspecialidad() {
  const { data } = await api.get('/reportes/medicamentos-por-especialidad');
  return data;
}

export async function getAnalisisAvanzado() {
  const { data } = await api.get('/reportes/analisis-avanzado');
  return data;
}
