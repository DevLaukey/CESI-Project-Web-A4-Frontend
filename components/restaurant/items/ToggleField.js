export default function ToggleField({
  label,
  value,
  onChange,
  activeText,
  inactiveText,
  activeColor = "bg-blue-600",
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-900">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
            value ? activeColor : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              value ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-gray-700">
          {value ? activeText : inactiveText}
        </span>
      </div>
    </div>
  );
}
