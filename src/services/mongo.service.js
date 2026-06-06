const { getDb } = require('../config/mongodb');

function getCollection() {
  return getDb().collection('historiales_clinicos');
}

function validarSignosVitales(signosVitales) {
  const camposRequeridos = [
    'presion_arterial_sistolica',
    'presion_arterial_diastolica',
    'frecuencia_cardiaca',
    'temperatura',
    'peso_kg',
  ];
  const faltantes = [];
  for (const campo of camposRequeridos) {
    if (signosVitales[campo] === undefined || signosVitales[campo] === null) {
      faltantes.push(campo);
    }
  }
  if (faltantes.length > 0) {
    return { valido: false, error: `Campos faltantes en signos_vitales: ${faltantes.join(', ')}` };
  }
  if (signosVitales.temperatura < 34 || signosVitales.temperatura > 42) {
    return { valido: false, error: 'Temperatura fuera de rango (34-42)' };
  }
  if (signosVitales.frecuencia_cardiaca < 30 || signosVitales.frecuencia_cardiaca > 200) {
    return { valido: false, error: 'Frecuencia cardíaca fuera de rango (30-200)' };
  }
  return { valido: true };
}

function normalizarDocumento(body) {
  const doc = {};

  doc.cita_id = body.cita_id;
  doc.paciente_id = body.paciente_id;
  doc.medico_id = body.medico_id;
  doc.especialidad = body.especialidad;

  doc.fecha_consulta = body.fecha_consulta instanceof Date
    ? body.fecha_consulta
    : new Date(body.fecha_consulta);

  if (isNaN(doc.fecha_consulta.getTime())) {
    return { valido: false, error: 'fecha_consulta inválida' };
  }

  doc.fecha_nacimiento_paciente = body.fecha_nacimiento_paciente instanceof Date
    ? body.fecha_nacimiento_paciente
    : (body.fecha_nacimiento_paciente ? new Date(body.fecha_nacimiento_paciente) : null);

  if (body.datos_base) {
    doc.datos_base = {
      motivo_consulta: body.datos_base.motivo_consulta,
      signos_vitales: {
        presion_arterial_sistolica: body.datos_base.signos_vitales?.presion_arterial_sistolica,
        presion_arterial_diastolica: body.datos_base.signos_vitales?.presion_arterial_diastolica,
        frecuencia_cardiaca: body.datos_base.signos_vitales?.frecuencia_cardiaca,
        temperatura: body.datos_base.signos_vitales?.temperatura,
        peso_kg: body.datos_base.signos_vitales?.peso_kg,
      },
      notas_adicionales: body.datos_base.notas_adicionales,
    };
  }

  doc.diagnosticos = body.diagnosticos || [];
  doc.medicamentos_recetados = body.medicamentos_recetados || [];
  doc.examenes_solicitados = body.examenes_solicitados || [];
  doc.datos_especificos_especialidad = body.datos_especificos_especialidad || {};

  return { valido: true, documento: doc };
}

function validarYNormalizar(body) {
  if (!body.cita_id || !body.paciente_id || !body.medico_id || !body.especialidad || !body.fecha_consulta) {
    return { valido: false, error: 'Faltan campos obligatorios: cita_id, paciente_id, medico_id, especialidad, fecha_consulta' };
  }

  if (!body.datos_base || !body.datos_base.signos_vitales) {
    return { valido: false, error: 'Faltan datos_base o signos_vitales' };
  }

  const validacionSignos = validarSignosVitales(body.datos_base.signos_vitales);
  if (!validacionSignos.valido) {
    return validacionSignos;
  }

  return normalizarDocumento(body);
}

async function insertarHistorial(doc) {
  const collection = getCollection();
  const result = await collection.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

async function getHistorialPorPaciente(paciente_id) {
  const collection = getCollection();
  return collection.aggregate([
    { $match: { paciente_id: parseInt(paciente_id, 10) } },
    { $sort: { fecha_consulta: 1 } },
    {
      $project: {
        _id: 0,
        fecha_consulta: 1,
        especialidad: 1,
        datos_base: 1,
        diagnosticos: 1,
        medicamentos_recetados: 1,
      },
    },
  ]).toArray();
}

async function getTopDiagnosticos(fechaInicioTrimestre) {
  const collection = getCollection();
  return collection.aggregate([
    { $match: { fecha_consulta: { $gte: fechaInicioTrimestre } } },
    { $unwind: '$diagnosticos' },
    {
      $group: {
        _id: {
          especialidad: '$especialidad',
          diagnostico: '$diagnosticos.descripcion',
        },
        total: { $sum: 1 },
      },
    },
    { $sort: { '_id.especialidad': 1, total: -1 } },
    {
      $group: {
        _id: '$_id.especialidad',
        top5: {
          $push: { diagnostico: '$_id.diagnostico', total: '$total' },
        },
      },
    },
    {
      $project: {
        especialidad: '$_id',
        top5: { $slice: ['$top5', 5] },
      },
    },
  ]).toArray();
}

async function getMedicamentosPorEspecialidad() {
  const collection = getCollection();
  return collection.aggregate([
    { $unwind: '$medicamentos_recetados' },
    {
      $group: {
        _id: {
          especialidad: '$especialidad',
          medicamento: '$medicamentos_recetados.nombre',
        },
        total: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.especialidad',
        medicamentos: {
          $push: { nombre: '$_id.medicamento', total: '$total' },
        },
        totalEspecialidad: { $sum: '$total' },
      },
    },
    { $unwind: '$medicamentos' },
    {
      $project: {
        _id: 0,
        especialidad: '$_id',
        medicamento: '$medicamentos.nombre',
        total: '$medicamentos.total',
        porcentaje: {
          $multiply: [
            { $divide: ['$medicamentos.total', '$totalEspecialidad'] },
            100,
          ],
        },
      },
    },
    { $sort: { especialidad: 1, porcentaje: -1 } },
  ]).toArray();
}

async function getAnalisisAvanzado() {
  const collection = getCollection();
  return collection.aggregate([
    {
      $facet: {
        signosVitalesPorEdad: [
          {
            $addFields: {
              edad: {
                $floor: {
                  $divide: [
                    { $subtract: ['$fecha_consulta', '$fecha_nacimiento_paciente'] },
                    365 * 24 * 60 * 60 * 1000,
                  ],
                },
              },
            },
          },
          {
            $addFields: {
              grupoEtario: {
                $switch: {
                  branches: [
                    { case: { $lte: ['$edad', 17] }, then: '0-17' },
                    { case: { $and: [{ $gte: ['$edad', 18] }, { $lte: ['$edad', 35] }] }, then: '18-35' },
                    { case: { $and: [{ $gte: ['$edad', 36] }, { $lte: ['$edad', 60] }] }, then: '36-60' },
                  ],
                  default: '60+',
                },
              },
            },
          },
          {
            $group: {
              _id: '$grupoEtario',
              promedioPresionSistolica: { $avg: '$datos_base.signos_vitales.presion_arterial_sistolica' },
              promedioFrecuenciaCardiaca: { $avg: '$datos_base.signos_vitales.frecuencia_cardiaca' },
              totalPacientes: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
        tiempoEntreConsultas: [
          { $sort: { paciente_id: 1, fecha_consulta: 1 } },
          {
            $group: {
              _id: '$paciente_id',
              fechas: { $push: '$fecha_consulta' },
              totalConsultas: { $sum: 1 },
            },
          },
          { $match: { totalConsultas: { $gte: 2 } } },
          {
            $project: {
              _id: 0,
              paciente_id: '$_id',
              totalConsultas: 1,
              intervaloPromedioDias: {
                $avg: {
                  $map: {
                    input: { $range: [0, { $subtract: [{ $size: '$fechas' }, 1] }] },
                    as: 'i',
                    in: {
                      $divide: [
                        {
                          $subtract: [
                            { $arrayElemAt: ['$fechas', { $add: ['$$i', 1] }] },
                            { $arrayElemAt: ['$fechas', '$$i'] },
                          ],
                        },
                        1000 * 60 * 60 * 24,
                      ],
                    },
                  },
                },
              },
            },
          },
          { $sort: { paciente_id: 1 } },
        ],
      },
    },
  ]).toArray();
}

module.exports = {
  validarYNormalizar,
  insertarHistorial,
  getHistorialPorPaciente,
  getTopDiagnosticos,
  getMedicamentosPorEspecialidad,
  getAnalisisAvanzado,
};
