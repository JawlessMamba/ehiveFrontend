import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './common/Header';
import Navigation from './common/Navigation';
import Footer from './common/Footer';
import LoadingSpinner from './common/LoadingSpinner';
import { useGetAllAssetTransfers } from '../../api/client/assettransfer';

function AssetHistory() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(20); // 20 records per page
  const [sortConfig, setSortConfig] = useState({
    key: "transfer_date",
    direction: "desc",
  });

  // Search state - removed debounced search
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // This will only be updated on manual search

  // Jump to page state
  const [jumpToPageInput, setJumpToPageInput] = useState("");

  // Use the optimized API hook with backend sorting
  const {
    data: transfers,
    total,
    totalPages,
    isLoading,
    isFetching,
    isError,
    error,
    refetch
  } = useGetAllAssetTransfers({
    page: currentPage,
    limit: pageLimit,
    search: searchTerm,
    sortKey: sortConfig.key,
    sortDirection: sortConfig.direction
  });

  // Removed the debounced search effect - search only happens manually now

  // Sort handler
  const handleSort = useCallback((key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  }, []);

  // Search handlers - only trigger search manually
  const handleSearch = useCallback(() => {
    setSearchTerm(searchInput.trim()); // Use trimmed input
    setCurrentPage(1); // Reset to first page when searching
  }, [searchInput]);

  const clearSearch = useCallback(() => {
    setSearchInput("");
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  // Handle Enter key press in search input
  const handleSearchKeyPress = useCallback((e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  }, [handleSearch]);

  // Date formatter
  const formatDate = useMemo(() => {
    return (dateString) => {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  // Jump to page handler
  const handleJumpToPage = useCallback(() => {
    const pageNum = parseInt(jumpToPageInput, 10);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setJumpToPageInput("");
    }
  }, [jumpToPageInput, totalPages]);

  // Generate page numbers for pagination (increased from 5 to 7 visible pages)
  const getPageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 7; // Changed from 5 to 7
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }, [currentPage, totalPages]);

  if (isLoading && !transfers.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading ownership history..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Asset Ownership History"
        subtitle="Complete audit trail of asset transfers and ownership changes"
        showRoleSelector={false}
      />
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {isError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error?.response?.data?.error || "Failed to load asset ownership history"}
              </div>
              <button
                onClick={() => refetch()}
                className="text-red-700 hover:text-red-900 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <i className="fas fa-exchange-alt text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transfers</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <i className="fas fa-search text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Page Results</p>
                <p className="text-2xl font-bold text-gray-900">{transfers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <i className="fas fa-calendar text-purple-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Latest Transfer</p>
                <p className="text-sm font-bold text-gray-900">
                  {transfers.length > 0
                    ? formatDate(transfers[0]?.transfer_date)
                    : "No transfers"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by serial number, owner names, departments, or user email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleSearchKeyPress} // Updated to use new handler
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                {isFetching && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isFetching}
              >
                <i className="fas fa-search mr-2"></i>Search
              </button>
              {searchTerm && ( // Only show clear button if there's an active search
                <button
                  onClick={clearSearch}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:ring-2 focus:ring-gray-500"
                >
                  <i className="fas fa-times mr-2"></i>Clear
                </button>
              )}
            </div>
          </div>
          {searchTerm && (
            <div className="mt-3 text-sm text-gray-600">
              Showing {transfers.length} of {total} transfer records matching "{searchTerm}" (Page {currentPage} of {totalPages})
            </div>
          )}
        </div>

        {/* History Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Transfer History</h3>
            <p className="text-sm text-gray-600">Complete audit trail of asset ownership changes</p>
          </div>

          {/* Table Container with Fixed Headers and Scrolling - Adjusted Height */}
          <div className="overflow-auto max-h-[600px] border border-gray-200">
            <div className="min-w-[1900px]">
              <table className="w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-700 sticky top-0 z-20 select-none">
                  <tr>
                    {/* Transfer Date */}
                    <th
                      className="px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                      style={{ width: '140px' }}
                      onClick={() => handleSort("transfer_date")}
                    >
                      <div className="flex items-center">
                        Transfer Date
                        {sortConfig.key === "transfer_date" && (
                          <i className={`fas fa-sort-${sortConfig.direction === "asc" ? "up" : "down"} ml-1`}></i>
                        )}
                      </div>
                    </th>

                    {/* Serial Number */}
                    <th
                      className="px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                      style={{ width: '120px' }}
                      onClick={() => handleSort("asset_serial_number")}
                    >
                      <div className="flex items-center">
                        Serial Number
                        {sortConfig.key === "asset_serial_number" && (
                          <i className={`fas fa-sort-${sortConfig.direction === "asc" ? "up" : "down"} ml-1`}></i>
                        )}
                      </div>
                    </th>

                    {/* Hardware Type */}
                    <th
                      className="px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                      style={{ width: '100px' }}
                      onClick={() => handleSort("hardware_type")}
                    >
                      <div className="flex items-center">
                        Type
                        {sortConfig.key === "hardware_type" && (
                          <i className={`fas fa-sort-${sortConfig.direction === "asc" ? "up" : "down"} ml-1`}></i>
                        )}
                      </div>
                    </th>

                    {/* Previous Owner */}
                    <th className="px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider" style={{ width: '400px' }}>
                      <div className="text-center border-b border-gray-500 pb-1 mb-2">Previous Owner</div>
                      <div className="grid grid-cols-4 gap-1 text-xs">
                        <div 
                          className="cursor-pointer hover:text-gray-300 truncate"
                          onClick={() => handleSort("previous_owner_fullname")}
                        >
                          Name
                          {sortConfig.key === "previous_owner_fullname" && (
                            <i className={`fas fa-sort-${sortConfig.direction === "asc" ? "up" : "down"} ml-1`}></i>
                          )}
                        </div>
                        <div className="truncate">P#</div>
                        <div 
                          className="cursor-pointer hover:text-gray-300 truncate"
                          onClick={() => handleSort("previous_department")}
                        >
                          Dept
                          {sortConfig.key === "previous_department" && (
                            <i className={`fas fa-sort-${sortConfig.direction === "asc" ? "up" : "down"} ml-1`}></i>
                          )}
                        </div>
                        <div className="truncate">Section</div>
                      </div>
                    </th>

                    {/* New Owner */}
                    <th className="px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider" style={{ width: '400px' }}>
                      <div className="text-center border-b border-gray-500 pb-1 mb-2">New Owner</div>
                      <div className="grid grid-cols-4 gap-1 text-xs">
                        <div 
                          className="cursor-pointer hover:text-gray-300 truncate"
                          onClick={() => handleSort("new_owner_fullname")}
                        >
                          Name
                          {sortConfig.key === "new_owner_fullname" && (
                            <i className={`fas fa-sort-${sortConfig.direction === "asc" ? "up" : "down"} ml-1`}></i>
                          )}
                        </div>
                        <div className="truncate">P#</div>
                        <div 
                          className="cursor-pointer hover:text-gray-300 truncate"
                          onClick={() => handleSort("new_department")}
                        >
                          Dept
                          {sortConfig.key === "new_department" && (
                            <i className={`fas fa-sort-${sortConfig.direction === "asc" ? "up" : "down"} ml-1`}></i>
                          )}
                        </div>
                        <div className="truncate">Section</div>
                      </div>
                    </th>

                    {/* Transfer Reason */}
                    <th
                      className="px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                      style={{ width: '180px' }}
                      onClick={() => handleSort("transfer_reason")}
                    >
                      <div className="flex items-center">
                        Reason
                        {sortConfig.key === "transfer_reason" && (
                          <i className={`fas fa-sort-${sortConfig.direction === "asc" ? "up" : "down"} ml-1`}></i>
                        )}
                      </div>
                    </th>

                    {/* Transferred By */}
                    <th
                      className="px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                      style={{ width: '180px' }}
                      onClick={() => handleSort("transferred_by_user_email")}
                    >
                      <div className="flex items-center">
                        Transferred By
                        {sortConfig.key === "transferred_by_user_email" && (
                          <i className={`fas fa-sort-${sortConfig.direction === "asc" ? "up" : "down"} ml-1`}></i>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transfers.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      {/* Transfer Date */}
                      <td className="px-2 py-2 whitespace-nowrap" style={{ width: '140px' }}>
                        <div className="text-xs font-medium text-gray-900">
                          {formatDate(record.transfer_date)}
                        </div>
                      </td>

                      {/* Serial Number */}
                      <td className="px-2 py-2 whitespace-nowrap" style={{ width: '120px' }}>
                        <div className="text-xs font-medium text-blue-600">
                          {record.asset_serial_number || "N/A"}
                        </div>
                      </td>

                      {/* Hardware Type */}
                      <td className="px-2 py-2 whitespace-nowrap" style={{ width: '100px' }}>
                        <div className="text-xs text-gray-900">
                          {record.hardware_type || "N/A"}
                        </div>
                      </td>

                      {/* Previous Owner */}
                      <td className="px-2 py-2" style={{ width: '400px' }}>
                        <div className="grid grid-cols-4 gap-1 text-xs">
                          <div className="font-medium text-gray-900 truncate" title={record.previous_owner_fullname || "N/A"}>
                            {record.previous_owner_fullname || "N/A"}
                          </div>
                          <div className="text-gray-600 truncate" title={record.previous_p_number || "N/A"}>
                            {record.previous_p_number || "N/A"}
                          </div>
                          <div className="text-gray-600 truncate" title={record.previous_department || "N/A"}>
                            {record.previous_department || "N/A"}
                          </div>
                          <div className="text-gray-600 truncate" title={record.previous_section || "N/A"}>
                            {record.previous_section || "N/A"}
                          </div>
                        </div>
                      </td>

                      {/* New Owner */}
                      <td className="px-2 py-2" style={{ width: '400px' }}>
                        <div className="grid grid-cols-4 gap-1 text-xs">
                          <div className="font-medium text-gray-900 truncate" title={record.new_owner_fullname || "N/A"}>
                            {record.new_owner_fullname || "N/A"}
                          </div>
                          <div className="text-gray-600 truncate" title={record.new_p_number || "N/A"}>
                            {record.new_p_number || "N/A"}
                          </div>
                          <div className="text-gray-600 truncate" title={record.new_department || "N/A"}>
                            {record.new_department || "N/A"}
                          </div>
                          <div className="text-gray-600 truncate" title={record.new_section || "N/A"}>
                            {record.new_section || "N/A"}
                          </div>
                        </div>
                      </td>

                      {/* Transfer Reason */}
                      <td className="px-2 py-2" style={{ width: '180px' }}>
                        <div className="text-xs text-gray-900 truncate" title={record.transfer_reason || "No reason provided"}>
                          {record.transfer_reason || "No reason provided"}
                        </div>
                      </td>

                      {/* Transferred By - Now shows proper user email */}
                      <td className="px-2 py-2 whitespace-nowrap" style={{ width: '180px' }}>
                        <div className="text-xs">
                          <div className="font-medium text-blue-600" title={record.transferred_by_user_email}>
                            {record.transferred_by_user_email}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {record.transferred_by_user_name} ({record.transferred_by_user_role})
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Sticky Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sticky bottom-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || isFetching}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || isFetching}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{((currentPage - 1) * pageLimit) + 1}</span>
                      {' '}to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * pageLimit, total)}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium">{total}</span>
                      {' '}results
                    </p>
                    
                    {/* Jump to Page */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">Go to:</span>
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={jumpToPageInput}
                        onChange={(e) => setJumpToPageInput(e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Page"
                        onKeyPress={(e) => e.key === "Enter" && handleJumpToPage()}
                      />
                      <button
                        onClick={handleJumpToPage}
                        disabled={isFetching || !jumpToPageInput}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Go
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {/* First Page */}
                      {currentPage > 4 && (
                        <>
                          <button
                            onClick={() => handlePageChange(1)}
                            disabled={isFetching}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            1
                          </button>
                          {currentPage > 5 && (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              ...
                            </span>
                          )}
                        </>
                      )}
                      
                      {/* Previous Page */}
                      <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1 || isFetching}
                        className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 ${currentPage <= 4 ? 'rounded-l-md' : ''}`}
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      
                      {/* Page Numbers */}
                      {getPageNumbers.map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isFetching}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } disabled:opacity-50`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      {/* Next Page */}
                      <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || isFetching}
                        className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 ${currentPage >= totalPages - 3 ? 'rounded-r-md' : ''}`}
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                      
                      {/* Last Page */}
                      {currentPage < totalPages - 3 && (
                        <>
                          {currentPage < totalPages - 4 && (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={isFetching}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}

          {transfers.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <i className="fas fa-history text-gray-400 text-4xl mb-4"></i>
              <p className="text-gray-500 text-lg">No transfer history found</p>
              <p className="text-gray-400">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Asset transfers will appear here once they occur"}
              </p>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-blue-600 text-xl"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                About Asset Ownership History
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    This page shows a complete audit trail of all asset
                    transfers and ownership changes
                  </li>
                  <li>
                    Each record includes asset serial number, previous owner, new owner, transfer
                    date, reason, and the user who performed the transfer
                  </li>
                  <li>
                    Use the search function to find specific serial numbers, owners,
                    transfer reasons, or user emails. Press Enter or click the Search button to execute the search.
                  </li>
                  <li>
                    Click column headers to sort the data by different criteria
                  </li>
                  <li>
                    The "Transferred By" column shows the email and name of the user who
                    performed the transfer
                  </li>
                  <li>
                    Each page shows 20 records for better performance
                  </li>
                  <li>
                    Use the "Go to" field in pagination to jump directly to any page
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AssetHistory;