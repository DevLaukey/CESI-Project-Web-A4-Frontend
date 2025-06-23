export default function ItemDetails({ item }) {


  return (
    <div className=" mx-auto  overflow-hidden border border-gray-100">
      {/* Header Section */}
      
          

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Description */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-gray-700 leading-relaxed">{item.description}</p>
        </div>

        {/* Price Section */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">€</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">€{item.price}</p>
            </div>

          {/* Preparation Time */}
          <div className="text-center">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <span className="text-blue-600">⏱️</span>
            </div>
            <p className="text-xs text-gray-600">Prep time</p>
            <p className="text-sm font-semibold text-gray-900">
              {item.preparationTime} min
            </p>
          </div>
        </div>

        
        {/* Dietary Information */}
        <div className="bg-gray-50 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🍽️</span>
            Dietary Information
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div
              className={`flex items-center p-3 rounded-lg ${
                item.isVegetarian
                  ? "bg-green-100 border border-green-200"
                  : "bg-gray-100"
              }`}
            >
            
              <div>
                <p className="text-sm font-medium text-gray-900">Vegetarian</p>
                <p
                  className={`text-xs ${
                    item.isVegetarian ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {item.isVegetarian ? "Yes" : "No"}
                </p>
              </div>
            </div>

            <div
              className={`flex items-center p-3 rounded-lg ${
                item.isVegan
                  ? "bg-green-100 border border-green-200"
                  : "bg-gray-100"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-gray-900">Vegan</p>
                <p
                  className={`text-xs ${
                    item.isVegan ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {item.isVegan ? "Yes" : "No"}
                </p>
              </div>
            </div>

            <div
              className={`flex items-center p-3 rounded-lg ${
                item.isGlutenFree
                  ? "bg-blue-100 border border-blue-200"
                  : "bg-gray-100"
              }`}
            >
             
              <div>
                <p className="text-sm font-medium text-gray-900">Gluten Free</p>
                <p
                  className={`text-xs ${
                    item.isGlutenFree ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {item.isGlutenFree ? "Yes" : "No"}
                </p>
              </div>
            </div>

            <div
              className={`flex items-center p-3 rounded-lg ${
                item.isSpicy
                  ? "bg-red-100 border border-red-200"
                  : "bg-gray-100"
              }`}
            >
       
              <div>
                <p className="text-xs font-medium text-gray-900">Spice Level</p>
                <p
                  className={`text-xs ${
                    item.isSpicy ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  {item.isSpicy ? `Level ${item.spicyLevel}` : "Mild"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">🏷️</span>
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 hover:from-blue-200 hover:to-blue-300 transition-colors"
                >
                  #{typeof tag === "object" ? tag.name : tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

     
    </div>
  );
}
