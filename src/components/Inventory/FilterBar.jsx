import React, { memo, useCallback, useMemo, useState } from 'react';
import ExportDropdown from './ExportDropdown';

// ✅ OPTIMIZED: Memoized FilterBar component with search button
const FilterBar = memo(({
  filters,
  handleFilterChange,
  clearFilters,
  filterOptions = {}, // Now comes from database
  filteredAssets,
  showExportDropdown,
  setShowExportDropdown,
  handleExportSelect,
  total = 0,
  fetched = 0,
  onSearch // New prop for search function
}) => {
  console.log('🔄 FilterBar rendering');
  
  // Local search state to avoid triggering API calls on every keystroke
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // ✅ OPTIMIZED: Handle search input locally (no API calls)
  const handleSearchInputChange = useCallback((e) => {
    setSearchInput(e.target.value);
  }, []);

  // ✅ NEW: Handle search button click or Enter key
  const executeSearch = useCallback(() => {
    if (onSearch) {
      onSearch(searchInput);
    } else {
      handleFilterChange("search", searchInput);
    }
  }, [searchInput, onSearch, handleFilterChange]);

  // ✅ NEW: Handle Enter key press in search
  const handleSearchKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  }, [executeSearch]);

  // ✅ NEW: Clear search
  const clearSearch = useCallback(() => {
    setSearchInput('');
    if (onSearch) {
      onSearch('');
    } else {
      handleFilterChange("search", '');
    }
  }, [onSearch, handleFilterChange]);

  // ✅ OPTIMIZED: Generic filter change handler
  const handleSelectChange = useCallback((filterKey) => (e) => {
    handleFilterChange(filterKey, e.target.value);
  }, [handleFilterChange]);

  // ✅ OPTIMIZED: Date filter handlers
  const handleDateChange = useCallback((filterKey) => (e) => {
    handleFilterChange(filterKey, e.target.value);
  }, [handleFilterChange]);

  // ✅ OPTIMIZED: Clear filters with confirmation
  const handleClearFilters = useCallback(() => {
    if (window.confirm("Clear all filters?")) {
      setSearchInput(''); // Clear local search state
      clearFilters();
    }
  }, [clearFilters]);

  // ✅ OPTIMIZED: Filter options with fallbacks
  const safeFilterOptions = useMemo(() => ({
    departments: filterOptions.departments || [],
    hardwareTypes: filterOptions.hardware_types || [],
    cadres: filterOptions.cadres || [],
    buildings: filterOptions.buildings || [],
    sections: filterOptions.sections || [],
    operationalStatuses: filterOptions.operational_statuses || [],
    dispositionStatuses: filterOptions.disposition_statuses || []
  }), [filterOptions]);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      {/* ✅ OPTIMIZED: Search Bar with Button */}
      <div className="flex justify-center mb-4">
        <div className="w-full max-w-2xl">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="🔍 Search by Asset ID, Serial #, Hostname, Model, Owner, Cadre, PO #, DC #, Vendor..."
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyPress={handleSearchKeyPress}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base shadow-sm transition-colors pr-10"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Clear search"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            
            <button
              onClick={executeSearch}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              title="Search assets"
            >
              <i className="fas fa-search mr-1"></i>
              Search
            </button>
          </div>
          
          {searchInput !== filters.search && (
            <div className="text-xs text-blue-500 mt-1 flex items-center">
              <i className="fas fa-info-circle mr-1"></i>
              Press Enter or click Search to apply your search
            </div>
          )}
        </div>
      </div>

      {/* ✅ OPTIMIZED: Filter Dropdowns Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mb-4">
        {/* Department Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
          <select
            value={filters.department || ''}
            onChange={handleSelectChange("department")}
            className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All ({safeFilterOptions.departments.length})</option>
            {safeFilterOptions.departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Hardware Type Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Hardware Type</label>
          <select
            value={filters.hardware_type || ''}
            onChange={handleSelectChange("hardware_type")}
            className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All ({safeFilterOptions.hardwareTypes.length})</option>
            {safeFilterOptions.hardwareTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Cadre Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Cadre</label>
          <select
            value={filters.cadre || ''}
            onChange={handleSelectChange("cadre")}
            className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All ({safeFilterOptions.cadres.length})</option>
            {safeFilterOptions.cadres.map((cadre) => (
              <option key={cadre} value={cadre}>
                {cadre}
              </option>
            ))}
          </select>
        </div>

        {/* Building Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Building</label>
          <select
            value={filters.building || ''}
            onChange={handleSelectChange("building")}
            className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All ({safeFilterOptions.buildings.length})</option>
            {safeFilterOptions.buildings.map((building) => (
              <option key={building} value={building}>
                {building}
              </option>
            ))}
          </select>
        </div>

        {/* Section Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Section</label>
          <select
            value={filters.section || ''}
            onChange={handleSelectChange("section")}
            className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All ({safeFilterOptions.sections.length})</option>
            {safeFilterOptions.sections.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
        </div>

        {/* Operational Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Op. Status</label>
          <select
            value={filters.operational_status || ''}
            onChange={handleSelectChange("operational_status")}
            className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All ({safeFilterOptions.operationalStatuses.length})</option>
            {safeFilterOptions.operationalStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Disposition Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Disp. Status</label>
          <select
            value={filters.disposition_status || ''}
            onChange={handleSelectChange("disposition_status")}
            className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All ({safeFilterOptions.dispositionStatuses.length})</option>
            {safeFilterOptions.dispositionStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ✅ OPTIMIZED: Date Range Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        {/* PO Date Range */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-medium text-gray-600 whitespace-nowrap">PO Date:</label>
          <div className="flex items-center space-x-1 flex-1">
            <span className="text-xs text-gray-500">From</span>
            <input
              type="date"
              value={filters.po_date_from || ''}
              onChange={handleDateChange("po_date_from")}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <span className="text-xs text-gray-500">To</span>
            <input
              type="date"
              value={filters.po_date_to || ''}
              onChange={handleDateChange("po_date_to")}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Assigned Date Range */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-medium text-gray-600 whitespace-nowrap">Assigned Date:</label>
          <div className="flex items-center space-x-1 flex-1">
            <span className="text-xs text-gray-500">From</span>
            <input
              type="date"
              value={filters.assigned_date_from || ''}
              onChange={handleDateChange("assigned_date_from")}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <span className="text-xs text-gray-500">To</span>
            <input
              type="date"
              value={filters.assigned_date_to || ''}
              onChange={handleDateChange("assigned_date_to")}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* DC Date Range */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-medium text-gray-600 whitespace-nowrap">DC Date:</label>
          <div className="flex items-center space-x-1 flex-1">
            <span className="text-xs text-gray-500">From</span>
            <input
              type="date"
              value={filters.dc_date_from || ''}
              onChange={handleDateChange("dc_date_from")}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <span className="text-xs text-gray-500">To</span>
            <input
              type="date"
              value={filters.dc_date_to || ''}
              onChange={handleDateChange("dc_date_to")}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ✅ OPTIMIZED: Bottom Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Results Counter */}
        <div className="text-sm text-gray-600">
          {filteredAssets && filteredAssets.length > 0 ? (
            <span>
              Showing {filteredAssets.length} assets
              {total !== fetched && (
                <span className="text-blue-600 font-medium"> 
                  {' '}(Page {Math.ceil((fetched || filteredAssets.length) / (filters.limit || 50))} of {Math.ceil(total / (filters.limit || 50))})
                </span>
              )}
            </span>
          ) : (
            <span>No assets found with current filters</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <ExportDropdown
            showExportDropdown={showExportDropdown}
            setShowExportDropdown={setShowExportDropdown}
            handleExportSelect={handleExportSelect}
          />
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <i className="fas fa-times mr-1"></i>
            Clear Filters
          </button>
        </div>
      </div>

      {/* ✅ NEW: Active Filters Display */}
      {Object.entries(filters).some(([key, value]) => 
        value !== "" && value !== null && value !== undefined && 
        !['page', 'limit'].includes(key)
      ) && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-sm font-medium text-blue-800">Active Filters:</span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value || ['page', 'limit'].includes(key)) return null;
              
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {key.replace('_', ' ')}: {value}
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              );
            })}
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

FilterBar.displayName = 'FilterBar';

export default FilterBar;