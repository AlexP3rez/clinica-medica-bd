export default function SelectField({ label, value, onChange, options, placeholder, loading, required, name }) {
  const selectClass = 'w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <div>
      {label && <label className={labelClass}>{label}</label>}
      <select name={name} value={value} onChange={onChange} className={selectClass} disabled={loading} required={required}>
        <option value="">{loading ? 'Cargando...' : placeholder || 'Seleccionar...'}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
