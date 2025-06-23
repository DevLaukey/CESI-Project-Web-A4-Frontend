export default function ItemActions({ onEdit, onDelete }) {
  return (
    <div className="flex space-x-2">
      <button
        onClick={onEdit}
        className="flex-1 bg-blue-600 text-white py-2 px-3 text-sm rounded-lg hover:bg-blue-700 transition-colors"
      >
        Edit
      </button>
      <button
        onClick={onDelete}
        className="bg-red-600 text-white py-2 px-3 text-sm rounded-lg hover:bg-red-700 transition-colors"
      >
        Delete
      </button>
    </div>
  );
}
