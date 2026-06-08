import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const NAV = [
  {
    label: 'Dashboard',
    items: [{ label: 'Inicio', to: '/' }],
  },
  {
    label: 'Maestros',
    items: [
      { label: 'Médicos', to: '/medicos' },
      { label: 'Pacientes', to: '/pacientes' },
    ],
  },
  {
    label: 'Citas',
    items: [
      { label: 'Nueva cita', to: '/citas/nueva' },
      { label: 'Cancelar cita', to: '/citas/cancelar' },
      { label: 'Horarios libres', to: '/citas/horarios' },
    ],
  },
  {
    label: 'Pagos',
    items: [
      { label: 'Registrar pago', to: '/pagos/registrar' },
      { label: 'Saldo paciente', to: '/pagos/saldo' },
    ],
  },
  {
    label: 'Historiales',
    items: [
      { label: 'Nuevo historial', to: '/historiales/nuevo' },
      { label: 'Buscar paciente', to: '/historiales/paciente' },
    ],
  },
  {
    label: 'Reportes',
    items: [
      { label: 'Agenda diaria', to: '/reportes/agenda' },
      { label: 'Facturas pendientes', to: '/reportes/facturas-pendientes' },
      { label: 'Ranking médicos', to: '/reportes/ranking' },
      { label: 'Facturación mensual', to: '/reportes/facturacion' },
      { label: 'Top diagnósticos', to: '/reportes/diagnosticos' },
      { label: 'Medicamentos', to: '/reportes/medicamentos' },
      { label: 'Análisis avanzado', to: '/reportes/analisis' },
    ],
  },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 flex flex-col`}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="text-lg font-bold text-blue-600 dark:text-blue-400">
            Clínica API
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {NAV.map((section) => (
            <div key={section.label}>
              <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                {section.label}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = location.pathname === item.to;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={() => setSidebarOpen(false)}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          active
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 lg:px-6 sticky top-0 z-30">
          <button
            className="lg:hidden mr-3 p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate flex-1">
            {NAV.flatMap((s) => s.items).find((i) => i.to === location.pathname)?.label || 'Clínica API'}
          </h1>

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="ml-3 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
