export default function FormError({ createError, fieldErrors }) {
  const hasErrors = createError || Object.keys(fieldErrors).length > 0;

  if (!hasErrors) return null;

  return (
    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
      <div className="flex items-start">
        <svg
          className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800">
            Please fix the following errors:
          </h4>
          {createError && (
            <p className="mt-1 text-sm text-red-700">{createError}</p>
          )}
          {Object.keys(fieldErrors).length > 0 && (
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
              {Object.entries(fieldErrors).map(([field, error]) => (
                <li key={field}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
