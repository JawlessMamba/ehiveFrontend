import React from 'react';

function ExportDropdown({ showExportDropdown, setShowExportDropdown, handleExportSelect, exportLoading = false }) {
  return (
    <div className="relative">
      <button
        onClick={() => setShowExportDropdown(!showExportDropdown)}
        className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        disabled={exportLoading}
      >
        <i className={`fas ${exportLoading ? 'fa-spinner fa-spin' : 'fa-download'} mr-2`}></i>
        {exportLoading ? 'Exporting...' : 'Export'}
        <i className="fas fa-chevron-down ml-2"></i>
      </button>
      {showExportDropdown && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-20 border border-gray-200">
          <div className="py-1">
            <button
              onClick={() => handleExportSelect('pdf')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              disabled={exportLoading}
            >
              <i className="fas fa-file-pdf text-red-600 mr-2"></i>
              PDF
            </button>
            <button
              onClick={() => handleExportSelect('csv')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              disabled={exportLoading}
            >
              <i className="fas fa-file-csv text-green-600 mr-2"></i>
              CSV
            </button>
            <button
              onClick={() => handleExportSelect('xlsx')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              disabled={exportLoading}
            >
              <i className="fas fa-file-excel text-blue-600 mr-2"></i>
              Excel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExportDropdown;