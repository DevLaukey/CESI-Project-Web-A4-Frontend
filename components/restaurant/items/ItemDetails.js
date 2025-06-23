export default function ItemDetails({ item }) {
  return (
    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
      {item.description}
    </p>
  );
}
