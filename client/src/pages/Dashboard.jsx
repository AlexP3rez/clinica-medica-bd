import { Link } from 'react-router-dom';

const CARDS = [
  {
    title: 'Citas',
    description: 'Crear, cancelar y consultar horarios disponibles',
    links: [
      { label: 'Nueva cita', to: '/citas/nueva' },
      { label: 'Cancelar cita', to: '/citas/cancelar' },
      { label: 'Horarios libres', to: '/citas/horarios' },
    ],
    color: 'blue',
  },
  {
    title: 'Pagos',
    description: 'Registrar pagos y consultar saldos de pacientes',
    links: [
      { label: 'Registrar pago', to: '/pagos/registrar' },
      { label: 'Saldo paciente', to: '/pagos/saldo' },
    ],
    color: 'emerald',
  },
  {
    title: 'Historiales Clinicos',
    description: 'Crear y consultar historiales clinicos (MongoDB)',
    links: [
      { label: 'Nuevo historial', to: '/historiales/nuevo' },
      { label: 'Buscar paciente', to: '/historiales/paciente/1' },
    ],
    color: 'purple',
  },
  {
    title: 'Reportes',
    description: 'Ranking de medicos, facturacion, diagnosticos y mas',
    links: [
      { label: 'Ranking medicos', to: '/reportes/ranking' },
      { label: 'Facturacion mensual', to: '/reportes/facturacion' },
      { label: 'Top diagnosticos', to: '/reportes/diagnosticos' },
      { label: 'Medicamentos', to: '/reportes/medicamentos' },
      { label: 'Analisis avanzado', to: '/reportes/analisis' },
    ],
    color: 'amber',
  },
];

const colorMap = {
  blue: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950',
  emerald: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950',
  purple: 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950',
  amber: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950',
};

const colorDarkText = {
  blue: 'dark:text-blue-300',
  emerald: 'dark:text-emerald-300',
  purple: 'dark:text-purple-300',
  amber: 'dark:text-amber-300',
};

const linkColorMap = {
  blue: 'text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40',
  emerald: 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40',
  purple: 'text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40',
  amber: 'text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40',
};

export default function Dashboard() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Panel Principal</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Sistema de gestion para clinica medica privada
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CARDS.map((card) => (
          <div key={card.title} className={`border rounded-xl p-6 ${colorMap[card.color]}`}>
            <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 ${colorDarkText[card.color]}`}>
              {card.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{card.description}</p>
            <div className="flex flex-wrap gap-2">
              {card.links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${linkColorMap[card.color]}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400">
        <strong>API:</strong> PostgreSQL (citas, facturas, pagos) + MongoDB (historiales clinicos) |{' '}
        <strong>Formato respuesta:</strong> {'{ success, data, error }'}
      </div>
    </div>
  );
}
