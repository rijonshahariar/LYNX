import React from 'react';

const ComplexityModal = ({ isOpen, onClose, analysis, isDark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`relative w-full max-w-2xl p-6 rounded-lg shadow-xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Code Complexity Analysis
        </h2>

        {analysis ? (
          <div className={`space-y-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <div className="p-3 rounded-lg bg-opacity-50 bg-gray-700">
              <h3 className="text-lg font-semibold text-green-400">{analysis.timeComplexity}</h3>
            </div>
            <div className="p-3 rounded-lg bg-opacity-50 bg-gray-700">
              <h3 className="text-lg font-semibold text-blue-400">{analysis.spaceComplexity}</h3>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Detailed Analysis</h3>
              <p className="whitespace-pre-wrap bg-gray-700 bg-opacity-50 p-3 rounded-lg">
                {analysis.explanation}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplexityModal; 