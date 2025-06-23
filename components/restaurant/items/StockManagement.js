// components/items/StockManagement.js
export default function StockManagement({ stock, onUpdateStock }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <button
        onClick={() => onUpdateStock(stock - 1)}
        disabled={stock === 0}
        className="bg-gray-100 text-gray-600 w-8 h-8 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        -
      </button>
      <span className="font-medium text-center min-w-[3rem]">{stock}</span>
      <button
        onClick={() => onUpdateStock(stock + 1)}
        className="bg-gray-100 text-gray-600 w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center"
      >
        +
      </button>
    </div>
  );
}
