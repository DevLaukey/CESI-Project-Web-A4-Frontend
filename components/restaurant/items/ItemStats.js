export default function ItemStats({ item, stockStatus }) {
  return (
    <div className="space-y-2 mb-4">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Stock:</span>
        <span className={`font-medium ${stockStatus.color}`}>
          {item.stock || 0} - {stockStatus.label}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Prep time:</span>
        <span className="font-medium">{item.preparationTime || 0} min</span>
      </div>
    </div>
  );
}