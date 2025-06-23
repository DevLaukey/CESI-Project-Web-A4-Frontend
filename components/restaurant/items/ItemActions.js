import { Pencil, Trash2 } from "lucide-react"; // optional icons

export default function ItemActions({ onEdit, onDelete }) {
  return (
    <div className="flex justify-between gap-3 mt-4">
      {/* Edit Button */}
      <button
        onClick={onEdit}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
      >
        <Pencil className="w-4 h-4" />
        Edit
      </button>

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
}
