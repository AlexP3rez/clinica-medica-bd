require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { faker } = require('@faker-js/faker');
const { connectMongo, getDb } = require('../config/mongodb');

faker.locale = 'es';

const ESPECIALIDADES = ['Cardiologia', 'Pediatria', 'Dermatologia', 'Ginecologia', 'Medicina General'];

const SIGNOS_VITALES_BASE = {
  presion_arterial_sistolica: () => faker.number.int({ min: 90, max: 160 }),
  presion_arterial_diastolica: () => faker.number.int({ min: 60, max: 100 }),
  frecuencia_cardiaca: () => faker.number.int({ min: 60, max: 100 }),
  temperatura: () => parseFloat((Math.random() * 5 + 34.5).toFixed(1)),
  peso_kg: () => parseFloat((Math.random() * 50 + 50).toFixed(1)),
};

const DATOS_ESPECIALIDAD = {
  'Cardiologia': () => ({
    antecedentes_cardiovasculares: faker.helpers.arrayElement([
      'hipertension', 'infarto_previo', 'arritmia', 'insuficiencia_cardiaca', 'ninguno',
    ]),
    dolor_escala_1_a_10: faker.number.int({ min: 1, max: 10 }),
    ritmo_cardiaco_regular: faker.datatype.boolean(),
  }),
  'Pediatria': () => ({
    peso_percentil: faker.number.int({ min: 5, max: 95 }),
    talla_percentil: faker.number.int({ min: 5, max: 95 }),
    esquema_vacunacion_completo: faker.datatype.boolean(),
  }),
  'Dermatologia': () => ({
    fototipo_piel: faker.helpers.arrayElement(['I', 'II', 'III', 'IV', 'V', 'VI']),
    area_afectada: faker.helpers.arrayElement([
      'cara', 'tronco', 'extremidades_superiores', 'extremidades_inferiores', 'cuero_cabelludo',
    ]),
    porcentaje_superficie_corporal: faker.number.int({ min: 1, max: 50 }),
  }),
  'Ginecologia': () => ({
    semanas_gestacion: faker.helpers.arrayElement([null, ...Array.from({ length: 40 }, (_, i) => i + 1)]),
    fecha_ultima_menstruacion: faker.date.recent({ days: 90 }),
    metodo_anticonceptivo: faker.helpers.arrayElement([
      'ninguno', 'anticonceptivos_orales', 'diu', 'implante', 'inyeccion',
    ]),
  }),
  'Medicina General': () => ({
    antecedentes_familiares: faker.helpers.arrayElement([
      'diabetes', 'hipertension', 'cancer', 'asma', 'ninguno',
    ]),
    habitos_tabaco: faker.helpers.arrayElement(['no_fuma', 'fumador_social', 'fumador_diario', 'exfumador']),
    habitos_alcohol: faker.helpers.arrayElement(['no_consume', 'ocasional', 'frecuente', 'exbebedor']),
  }),
};

const CODIGOS_CIE10 = [
  { codigo: 'I10', descripcion: 'Hipertension esencial primaria' },
  { codigo: 'E11', descripcion: 'Diabetes mellitus tipo 2' },
  { codigo: 'J45', descripcion: 'Asma' },
  { codigo: 'J20', descripcion: 'Bronquitis aguda' },
  { codigo: 'L70', descripcion: 'Acne' },
  { codigo: 'L20', descripcion: 'Dermatitis atopica' },
  { codigo: 'N39', descripcion: 'Infeccion de vias urinarias' },
  { codigo: 'M54', descripcion: 'Dorsalgia' },
  { codigo: 'G43', descripcion: 'Migrana' },
  { codigo: 'K21', descripcion: 'Enfermedad por reflujo gastroesofagico' },
  { codigo: 'I25', descripcion: 'Enfermedad cardiaca isquemica cronica' },
  { codigo: 'J30', descripcion: 'Rinitis alergica' },
  { codigo: 'E78', descripcion: 'Hiperlipidemia' },
  { codigo: 'F41', descripcion: 'Trastorno de ansiedad' },
  { codigo: 'A09', descripcion: 'Diarrea y gastroenteritis' },
  { codigo: 'H10', descripcion: 'Conjuntivitis' },
  { codigo: 'B35', descripcion: 'Dermatofitosis' },
  { codigo: 'O26', descripcion: 'Complicaciones del embarazo' },
  { codigo: 'Z00', descripcion: 'Examen medico general' },
  { codigo: 'R51', descripcion: 'Cefalea' },
];

const ESPECIALIDAD_CODIGOS = {
  'Cardiologia': [0, 10, 12],
  'Pediatria': [2, 3, 5, 8, 14],
  'Dermatologia': [4, 5, 16],
  'Ginecologia': [6, 17],
  'Medicina General': [0, 1, 8, 9, 13, 15, 18, 19],
};

const MEDICAMENTOS = [
  { nombre: 'Ibuprofeno', dosis: '400mg', frecuencia: 'cada 8 horas', duracion_dias: 7 },
  { nombre: 'Paracetamol', dosis: '500mg', frecuencia: 'cada 6 horas', duracion_dias: 5 },
  { nombre: 'Amoxicilina', dosis: '500mg', frecuencia: 'cada 8 horas', duracion_dias: 10 },
  { nombre: 'Omeprazol', dosis: '20mg', frecuencia: 'cada 24 horas', duracion_dias: 30 },
  { nombre: 'Losartan', dosis: '50mg', frecuencia: 'cada 24 horas', duracion_dias: 30 },
  { nombre: 'Metformina', dosis: '850mg', frecuencia: 'cada 12 horas', duracion_dias: 30 },
  { nombre: 'Atorvastatina', dosis: '20mg', frecuencia: 'cada 24 horas', duracion_dias: 30 },
  { nombre: 'Salbutamol', dosis: '100mcg', frecuencia: 'cada 6 horas', duracion_dias: 14 },
  { nombre: 'Cetirizina', dosis: '10mg', frecuencia: 'cada 24 horas', duracion_dias: 15 },
  { nombre: 'Clotrimazol', dosis: '1% topico', frecuencia: 'cada 12 horas', duracion_dias: 14 },
  { nombre: 'Acido Folico', dosis: '5mg', frecuencia: 'cada 24 horas', duracion_dias: 90 },
  { nombre: 'Hidroclorotiazida', dosis: '25mg', frecuencia: 'cada 24 horas', duracion_dias: 30 },
  { nombre: 'Prednisona', dosis: '20mg', frecuencia: 'cada 24 horas', duracion_dias: 10 },
  { nombre: 'Azitromicina', dosis: '500mg', frecuencia: 'cada 24 horas', duracion_dias: 3 },
  { nombre: 'Loratadina', dosis: '10mg', frecuencia: 'cada 24 horas', duracion_dias: 15 },
];

const EXAMENES = [
  'Hemograma completo',
  'Perfil lipidico',
  'Glicemia en ayunas',
  'Creatinina serica',
  'Radiografia de torax',
  'Electrocardiograma',
  'Ecografia abdominal',
  'Prueba de funcion pulmonar',
  'Examen de orina',
  'TSH',
  'Colonoscopia',
  'Mamografia',
  'Papanicolaou',
  'Test de alergia',
  'Biopsia de piel',
];

function generarDiagnosticos(especialidad) {
  const codigosIdx = ESPECIALIDAD_CODIGOS[especialidad] || [0, 1];
  const num = Math.floor(Math.random() * 3) + 1;
  const diags = [];
  for (let i = 0; i < num; i++) {
    const idx = faker.helpers.arrayElement(codigosIdx);
    const cie = CODIGOS_CIE10[idx];
    diags.push({
      codigo_cie10: cie.codigo,
      descripcion: cie.descripcion,
      tipo: faker.helpers.arrayElement(['Presuntivo', 'Definitivo']),
    });
  }
  return diags;
}

function generarMedicamentos() {
  const num = Math.floor(Math.random() * 4);
  if (num === 0) return [];
  const meds = [];
  const usados = new Set();
  for (let i = 0; i < num; i++) {
    let med;
    do {
      med = faker.helpers.arrayElement(MEDICAMENTOS);
    } while (usados.has(med.nombre));
    usados.add(med.nombre);
    meds.push({ ...med });
  }
  return meds;
}

function generarExamenes() {
  const num = Math.floor(Math.random() * 4);
  if (num === 0) return [];
  const examenes = [];
  const usados = new Set();
  for (let i = 0; i < num; i++) {
    let ex;
    do {
      ex = faker.helpers.arrayElement(EXAMENES);
    } while (usados.has(ex));
    usados.add(ex);
    examenes.push(ex);
  }
  return examenes;
}

function generarHistorial(cita_id, paciente_id, medico_id, especialidad) {
  const fechaCons = faker.date.recent({ days: 180 });

  const edadAleatoria = faker.number.int({ min: 0, max: 85 });
  const fechaNacimiento = new Date(fechaCons);
  fechaNacimiento.setFullYear(fechaNacimiento.getFullYear() - edadAleatoria);

  return {
    cita_id,
    paciente_id,
    medico_id,
    especialidad,
    fecha_consulta: fechaCons,
    fecha_nacimiento_paciente: fechaNacimiento,
    datos_base: {
      motivo_consulta: faker.helpers.arrayElement([
        'Dolor de cabeza persistente',
        'Control de rutina',
        'Dolor abdominal agudo',
        'Fiebre alta',
        'Dolor en el pecho',
        'Erupcion cutanea',
        'Control prenatal',
        'Tos persistente',
        'Mareos frecuentes',
        'Dolor articular',
        'Problemas de vision',
        'Insomnio cronico',
        'Perdida de peso inexplicable',
        'Alergia estacional',
        'Lesion deportiva',
      ]),
      signos_vitales: {
        presion_arterial_sistolica: SIGNOS_VITALES_BASE.presion_arterial_sistolica(),
        presion_arterial_diastolica: SIGNOS_VITALES_BASE.presion_arterial_diastolica(),
        frecuencia_cardiaca: SIGNOS_VITALES_BASE.frecuencia_cardiaca(),
        temperatura: SIGNOS_VITALES_BASE.temperatura(),
        peso_kg: SIGNOS_VITALES_BASE.peso_kg(),
      },
      notas_adicionales: faker.helpers.maybe(
        () => faker.lorem.sentence({ min: 5, max: 20 }),
        { probability: 0.7 }
      ) || '',
    },
    diagnosticos: generarDiagnosticos(especialidad),
    medicamentos_recetados: generarMedicamentos(),
    examenes_solicitados: generarExamenes(),
    datos_especificos_especialidad: DATOS_ESPECIALIDAD[especialidad](),
  };
}

async function main() {
  await connectMongo();
  const db = getDb();
  const collection = db.collection('historiales_clinicos');

  const total = 150;
  const batchSize = 25;

  console.log(`Generando ${total} historiales clinicos...`);

  for (let i = 0; i < total; i += batchSize) {
    const batch = [];
    for (let j = 0; j < batchSize && (i + j) < total; j++) {
      const cita_id = 1000 + i + j;
      const paciente_id = faker.number.int({ min: 1, max: 30 });
      const medico_id = faker.number.int({ min: 1, max: 10 });
      const especialidad = faker.helpers.arrayElement(ESPECIALIDADES);

      batch.push(generarHistorial(cita_id, paciente_id, medico_id, especialidad));
    }

    await collection.insertMany(batch);
    console.log(`  Insertados ${i + batch.length} de ${total}`);
  }

  console.log('Seed MongoDB completado exitosamente');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error en seed MongoDB:', err.message);
  process.exit(1);
});
