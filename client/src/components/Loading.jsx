export default function Loading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
      <span className="ml-3 text-gray-500 dark:text-gray-400 text-sm">Cargando...</span>
    </div>
  );
}
