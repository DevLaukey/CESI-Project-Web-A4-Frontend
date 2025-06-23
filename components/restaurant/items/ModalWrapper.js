  export default function ModalWrapper({ 
    title, 
    subtitle, 
    onClose, 
    children, 
    size = "2xl" 
  }) {
    const sizeClasses = {
      "xl": "max-w-xl",
      "2xl": "max-w-2xl", 
      "3xl": "max-w-3xl",
      "4xl": "max-w-4xl"
    };
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white/60 to-indigo-50/80 backdrop-blur-sm"
          onClick={onClose}
        ></div>
  
        {/* Modal Container */}
        <div className={`relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
              {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
  
          {/* Content */}
          {children}
        </div>
      </div>
    );
  }