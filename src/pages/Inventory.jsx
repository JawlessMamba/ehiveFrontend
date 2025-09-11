import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '../components/common/Header';
import Navigation from '../components/common/Navigation';
import Footer from '../components/common/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import TransferModal from '../components/Inventory/TransferModal';
import AssetsTable from '../components/Inventory/AssetsTable';
import FilterBar from '../components/Inventory/FilterBar';
import { useGetFilterOptions } from "../../api/client/asset";


import {
  useGetAllAssets,
  useMarkAssetSurplus,
  useUpdateAsset,
  useExportAssets,
  useCheckExpiringAssets  // ✅ NEW: Import the new hook
} from "../../api/client/asset";
import { useAllCategories } from '../../api/client/category';
import { useGetCurrentUser } from '../../api/client/user';
import { toast } from 'react-toastify';

function Inventory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('admin');
  const [editingAsset, setEditingAsset] = useState(null);
  const [transferringAsset, setTransferringAsset] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  
  // ✅ NEW: Search query state (removed debounced search)
  const [searchQuery, setSearchQuery] = useState("");
  
  // ✅ OPTIMIZED: Filters state with better structure
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    hardware_type: "",
    cadre: "",
    building: "",
    section: "",
    operational_status: "",
    disposition_status: "",
    po_date_from: "",
    po_date_to: "",
    assigned_date_from: "",
    assigned_date_to: "",
    dc_date_from: "",
    dc_date_to: "",
    page: 1,
    limit: 50, // ✅ Increased for better UX
  });

  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "desc",
  });

  // ✅ NEW: Fetch filter options from database
  const { 
    data: filterOptions, 
    isLoading: filterOptionsLoading 
  } = useGetFilterOptions();

  // ✅ Create filters object for API call (using direct search query)
  const apiFilters = useMemo(() => ({
    ...filters,
    search: searchQuery, // Use direct search query
  }), [filters, searchQuery]);

  // ✅ OPTIMIZED: Single API call with server-side filtering
  const { 
    data: assets, 
    total, 
    page, 
    limit, 
    fetched,
    isLoading: apiLoading, 
    isFetching,
    error: apiError 
  } = useGetAllAssets(apiFilters);

  const { markSurplus } = useMarkAssetSurplus();
  const { data: user } = useGetCurrentUser();
  const { updateAsset, isLoading: updateLoading } = useUpdateAsset();
  const { combinedOptions: categories } = useAllCategories([
    "department",
    "section", 
    "hardware_type",
    "cadre",
    "building"
  ]);

  // ✅ Export hook
  const { exportAssets: fetchExportData, isLoading: exportLoading } = useExportAssets();

  // ✅ NEW: Expiring assets check hook
  const { checkExpiringAssets, isLoading: checkingExpiry } = useCheckExpiringAssets();

  // ✅ OPTIMIZED: Date formatting functions
  const formatDateToDDMMYYYY = useCallback((dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  // ✅ UPDATED: Handle filter changes with improved search handling
  const handleFilterChange = useCallback((key, value) => {
    if (key === 'search') {
      // Don't update filters for search, just set the query
      setSearchQuery(value);
      setFilters(prev => ({
        ...prev,
        search: value,
        page: 1, // Reset to page 1 for new search
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: value,
        page: key === 'page' ? value : 1, // Reset to page 1 for new filters
      }));
    }
  }, []);

  // ✅ NEW: Handle search execution
  const handleSearch = useCallback((searchValue) => {
    setSearchQuery(searchValue);
    setFilters(prev => ({
      ...prev,
      search: searchValue,
      page: 1
    }));
  }, []);

  // ✅ UPDATED: Clear filters with search query
  const clearFilters = useCallback(() => {
    setSearchQuery(""); // Clear search query
    setFilters({
      search: "",
      department: "",
      hardware_type: "",
      cadre: "",
      building: "",
      section: "",
      operational_status: "",
      disposition_status: "",
      po_date_from: "",
      po_date_to: "",
      assigned_date_from: "",
      assigned_date_to: "",
      dc_date_from: "",
      dc_date_to: "",
      page: 1,
      limit: 50,
    });
  }, []);

  // ✅ OPTIMIZED: Pagination handlers
  const goToPage = useCallback((pageNumber) => {
    handleFilterChange('page', pageNumber);
  }, [handleFilterChange]);

  const goToNextPage = useCallback(() => {
    if (page < Math.ceil(total / limit)) {
      handleFilterChange('page', page + 1);
    }
  }, [page, total, limit, handleFilterChange]);

  const goToPrevPage = useCallback(() => {
    if (page > 1) {
      handleFilterChange('page', page - 1);
    }
  }, [page, handleFilterChange]);

  // ✅ NEW: Handle expiring assets check
  const handleCheckExpiringAssets = useCallback(() => {
    checkExpiringAssets({
      onSuccess: (result) => {
        toast.success(`Expiry check completed! ${result.updated || 0} assets updated to "Nearing Replacement"`);
      },
      onError: (error) => {
        console.error('Expiry check failed:', error);
        toast.error('Failed to check expiring assets');
      }
    });
  }, [checkExpiringAssets]);

  // ✅ FIXED: Export functions with proper error handling
  const exportToPDF = useCallback(async () => {
    if (exportLoading) return;
    
    console.log('📄 Starting PDF export with filters:', apiFilters);
    
    fetchExportData(apiFilters, {
      onSuccess: (exportData) => {
        console.log(`📄 Generating PDF with ${exportData.length} assets`);
        if (exportData && exportData.length > 0) {
          generatePDF(exportData);
        } else {
          toast.warn('No data available for export');
        }
      },
      onError: (error) => {
        console.error('PDF export failed:', error);
        toast.error('Failed to export PDF');
      }
    });
  }, [exportLoading, fetchExportData, apiFilters]);

  const exportToCSV = useCallback(async () => {
    if (exportLoading) return;
    
    console.log('📊 Starting CSV export with filters:', apiFilters);
    
    fetchExportData(apiFilters, {
      onSuccess: (exportData) => {
        console.log(`📊 Generating CSV with ${exportData.length} assets`);
        if (exportData && exportData.length > 0) {
          generateCSV(exportData);
        } else {
          toast.warn('No data available for export');
        }
      },
      onError: (error) => {
        console.error('CSV export failed:', error);
        toast.error('Failed to export CSV');
      }
    });
  }, [exportLoading, fetchExportData, apiFilters]);

  const exportToXLSX = useCallback(async () => {
    if (exportLoading) return;
    
    console.log('📈 Starting Excel export with filters:', apiFilters);
    
    fetchExportData(apiFilters, {
      onSuccess: (exportData) => {
        console.log(`📈 Generating Excel with ${exportData.length} assets`);
        if (exportData && exportData.length > 0) {
          generateExcel(exportData);
        } else {
          toast.warn('No data available for export');
        }
      },
      onError: (error) => {
        console.error('Excel export failed:', error);
        toast.error('Failed to export Excel');
      }
    });
  }, [exportLoading, fetchExportData, apiFilters]);

  // ✅ FIXED: PDF Generation with complete column headers
  const generatePDF = useCallback((exportData) => {
    try {
      const doc = new jsPDF('landscape', 'mm', 'a3');
      doc.setFontSize(18);
      doc.text('Asset Inventory Report', 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);
      doc.text(`Total Assets: ${exportData.length}`, 14, 32);
      
      // Show applied filters
      const activeFilters = Object.entries(filters)
        .filter(([key, value]) => value !== "" && !['page', 'limit'].includes(key))
        .map(([key, value]) => `${key.replace('_', ' ')}: ${value}`);
      
      let yPosition = 39;
      if (activeFilters.length > 0) {
        doc.text('Applied Filters: ' + activeFilters.join(', '), 14, yPosition);
        yPosition += 10;
      } else {
        yPosition += 5;
      }

      // Complete column headers matching database schema
      const headers = [
        'ID', 'Asset ID', 'Serial Number', 'Hardware Type', 'Model Number', 'Owner Name', 'Hostname',
        'P Number', 'Cadre', 'Department', 'Section', 'Building', 'Vendor',
        'PO Number', 'PO Date', 'DC Number', 'DC Date', 'Assigned Date',
        'Replacement Due Period', 'Replacement Due Date', 'Operational Status', 'Disposition Status'
      ];
      
      const columnWidths = [8, 16, 20, 16, 18, 20, 24, 16, 16, 16, 14, 16, 20, 16, 14, 16, 14, 14, 20, 16, 18, 18];
      const startX = 8;
      const rowHeight = 6;

      // Draw header
      const drawTableHeader = (y) => {
        doc.setFillColor(55, 65, 81);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.setFont(undefined, 'bold');
        let currentX = startX;
        headers.forEach((header, index) => {
          doc.rect(currentX, y, columnWidths[index], rowHeight, 'F');
          const textWidth = doc.getTextWidth(header);
          const centerX = currentX + (columnWidths[index] - textWidth) / 2;
          doc.text(header, centerX, y + 4);
          currentX += columnWidths[index];
        });
        return y + rowHeight;
      };

      yPosition = drawTableHeader(yPosition);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(5);

      // Draw rows
      exportData.forEach((asset, rowIndex) => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
          yPosition = drawTableHeader(yPosition);
          doc.setTextColor(0, 0, 0);
          doc.setFont(undefined, 'normal');
          doc.setFontSize(5);
        }

        const rowData = [
          asset.id || '', asset.asset_id || '', asset.serial_number || '', asset.hardware_type || '',
          asset.model_number || '', asset.owner_fullname || '', asset.hostname || '', 
          asset.p_number || '', asset.cadre || '', asset.department || '', asset.section || '',
          asset.building || '', asset.vendor || '', asset.po_number || '', 
          formatDateToDDMMYYYY(asset.po_date) || '', asset.dc_number || '', 
          formatDateToDDMMYYYY(asset.dc_date) || '', formatDateToDDMMYYYY(asset.assigned_date) || '',
          asset.replacement_due_period || '', formatDateToDDMMYYYY(asset.replacement_due_date) || '',
          asset.operational_status || '', asset.disposition_status || ''
        ];

        // Alternate row colors
        if (rowIndex % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          let currentX = startX;
          headers.forEach((_, index) => {
            doc.rect(currentX, yPosition, columnWidths[index], rowHeight, 'F');
            currentX += columnWidths[index];
          });
        }

        // Draw cell data
        let currentX = startX;
        rowData.forEach((cellData, colIndex) => {
          doc.rect(currentX, yPosition, columnWidths[colIndex], rowHeight);
          let displayText = cellData.toString();
          const maxWidth = columnWidths[colIndex] - 1;
          const lines = doc.splitTextToSize(displayText, maxWidth);
          if (lines.length > 1) {
            displayText = lines[0];
            if (displayText.length < cellData.toString().length) {
              displayText = displayText.substring(0, displayText.length - 3) + '...';
            }
          }
          doc.text(displayText, currentX + 0.5, yPosition + 4);
          currentX += columnWidths[colIndex];
        });
        yPosition += rowHeight;
      });

      doc.save(`asset-inventory-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(`PDF exported successfully with ${exportData.length} assets!`);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  }, [filters, formatDateToDDMMYYYY]);

  // ✅ FIXED: CSV Generation with complete data
  const generateCSV = useCallback((exportData) => {
    try {
      const headers = [
        'ID', 'Asset ID', 'Serial Number', 'Hardware Type', 'Model Number', 'Owner Name', 'Hostname',
        'P Number', 'Cadre', 'Department', 'Section', 'Building', 'Vendor',
        'PO Number', 'PO Date', 'DC Number', 'DC Date', 'Assigned Date',
        'Replacement Due Period', 'Replacement Due Date', 'Operational Status', 'Disposition Status'
      ];
      
      const csvData = exportData.map(asset => [
        asset.id || '', asset.asset_id || '', asset.serial_number || '', asset.hardware_type || '',
        asset.model_number || '', asset.owner_fullname || '', asset.hostname || '',
        asset.p_number || '', asset.cadre || '', asset.department || '', asset.section || '',
        asset.building || '', asset.vendor || '', asset.po_number || '',
        formatDateToDDMMYYYY(asset.po_date) || '', asset.dc_number || '',
        formatDateToDDMMYYYY(asset.dc_date) || '', formatDateToDDMMYYYY(asset.assigned_date) || '',
        asset.replacement_due_period || '', formatDateToDDMMYYYY(asset.replacement_due_date) || '',
        asset.operational_status || '', asset.disposition_status || ''
      ]);
      
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `asset-inventory-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success(`CSV exported successfully with ${exportData.length} assets!`);
    } catch (error) {
      console.error('CSV generation error:', error);
      toast.error('Failed to generate CSV');
    }
  }, [formatDateToDDMMYYYY]);

  // ✅ FIXED: Excel Generation with complete data
  const generateExcel = useCallback((exportData) => {
    try {
      const worksheetData = exportData.map(asset => ({
        'ID': asset.id || '',
        'Asset ID': asset.asset_id || '',
        'Serial Number': asset.serial_number || '',
        'Hardware Type': asset.hardware_type || '',
        'Model Number': asset.model_number || '',
        'Owner Name': asset.owner_fullname || '',
        'Hostname': asset.hostname || '',
        'P Number': asset.p_number || '',
        'Cadre': asset.cadre || '',
        'Department': asset.department || '',
        'Section': asset.section || '',
        'Building': asset.building || '',
        'Vendor': asset.vendor || '',
        'PO Number': asset.po_number || '',
        'PO Date': formatDateToDDMMYYYY(asset.po_date) || '',
        'DC Number': asset.dc_number || '',
        'DC Date': formatDateToDDMMYYYY(asset.dc_date) || '',
        'Assigned Date': formatDateToDDMMYYYY(asset.assigned_date) || '',
        'Replacement Due Period': asset.replacement_due_period || '',
        'Replacement Due Date': formatDateToDDMMYYYY(asset.replacement_due_date) || '',
        'Operational Status': asset.operational_status || '',
        'Disposition Status': asset.disposition_status || ''
      }));
      
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      
      // Set column widths (22 columns total)
      const colWidths = [
        { wch: 8 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 12 },
        { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 18 },
        { wch: 15 }, { wch: 15 }
      ];
      worksheet['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Asset Inventory');
      XLSX.writeFile(workbook, `asset-inventory-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success(`Excel exported successfully with ${exportData.length} assets!`);
    } catch (error) {
      console.error('Excel generation error:', error);
      toast.error('Failed to generate Excel file');
    }
  }, [formatDateToDDMMYYYY]);

  const handleExportSelect = useCallback((format) => {
    setShowExportDropdown(false);
    switch (format) {
      case 'pdf': exportToPDF(); break;
      case 'csv': exportToCSV(); break;
      case 'xlsx': exportToXLSX(); break;
      default: break;
    }
  }, [exportToPDF, exportToCSV, exportToXLSX]);

  // ✅ OPTIMIZED: Asset management functions
  const startEditing = useCallback((asset) => {
    setEditingAsset({ ...asset });
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingAsset(null);
  }, []);

  const saveAsset = useCallback(() => {
    if (!editingAsset) return;

    updateAsset(
      { id: editingAsset.id, data: editingAsset },
      {
        onSuccess: () => {
          setEditingAsset(null);
          setError(null);
        },
        onError: (err) => {
          console.error(err);
          setError(err.message);
        }
      }
    );
  }, [editingAsset, updateAsset]);

  const markAsSurplus = useCallback((assetId) => {
    if (!window.confirm("Are you sure you want to mark this asset as surplus?")) return;

    markSurplus(assetId, {
      onError: (err) => {
        console.error("Failed to mark asset as surplus:", err);
      },
      onSuccess: () => {
        console.log("Asset marked as surplus successfully:", assetId);
      },
    });
  }, [markSurplus]);

  const startTransfer = useCallback((asset) => {
    setTransferringAsset({
      id: asset.id, 
      asset_id: asset.asset_id, 
      serial_number: asset.serial_number,
      asset_category: asset.hardware_type,
      model: asset.model_number,
      owner: asset.owner_fullname,
      current_owner: asset.owner_fullname,
      po_number: asset.p_number,
      cadre: asset.cadre,
      current_cadre: asset.cadre,
      department: asset.department,
      building: asset.building
    });
  }, []);

  const cancelTransfer = useCallback(() => {
    setTransferringAsset(null);
  }, []);

  const handleTransferSuccess = useCallback(() => {
    setTransferringAsset(null);
    setError(null);
    // ✅ Trigger refetch to get updated data
    // The query will automatically refetch due to invalidation
  }, []);

  // ✅ OPTIMIZED: Loading state with custom LoadingSpinner
  if (apiLoading && !assets?.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner 
          size="xl" 
          text="Loading Inventory Assets..."
        />
      </div>
    );
  }

  // ✅ OPTIMIZED: Calculate pagination info
  const totalPages = Math.ceil(total / limit);
  const startItem = ((page - 1) * limit) + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Inventory Management"
        subtitle={`Manage all ${total} IT assets`}
        userRole={userRole}
        setUserRole={setUserRole}
      />
      <Navigation />
      
      {transferringAsset && (
        <TransferModal
          transferringAsset={transferringAsset}
          categories={categories}
          onTransferSuccess={handleTransferSuccess}
          cancelTransfer={cancelTransfer}
          setError={setError}
        />
      )}
      
      <main className="max-w-full mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* ✅ UPDATED: Filter Bar with database filter options */}
        <FilterBar
          filters={filters}
          handleFilterChange={handleFilterChange}
          clearFilters={clearFilters}
          filterOptions={filterOptions} // Pass database filter options
          filteredAssets={assets}
          showExportDropdown={showExportDropdown}
          setShowExportDropdown={setShowExportDropdown}
          handleExportSelect={handleExportSelect}
          total={total}
          fetched={fetched}
          onSearch={handleSearch} // Pass search handler
          isLoading={filterOptionsLoading} // Pass loading state for filter options
          // ✅ NEW: Pass expiring assets props
          checkExpiringAssets={handleCheckExpiringAssets}
          checkingExpiry={checkingExpiry}
        />

        {/* ✅ NEW: Pagination Info & Controls (Top) */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600">
              {isFetching ? (
                <span className="flex items-center">
                  <LoadingSpinner size="xs" />
                  <span className="ml-2">Loading...</span>
                </span>
              ) : (
                `Showing ${startItem}-${endItem} of ${total} assets (${fetched} loaded)`
              )}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPrevPage}
                  disabled={page <= 1}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                >
                  Previous
                </button>
                
                <span className="px-3 py-1 text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                
                <button
                  onClick={goToNextPage}
                  disabled={page >= totalPages}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* ✅ OPTIMIZED: Assets Table */}
        <AssetsTable
          filteredAssets={assets} // Only current page assets
          editingAsset={editingAsset}
          setEditingAsset={setEditingAsset}
          categories={categories}
          userRole={userRole}
          sortConfig={sortConfig}
          handleSort={() => {}} // Sorting disabled for now (can be implemented server-side)
          startEditing={startEditing}
          cancelEditing={cancelEditing}
          saveAsset={saveAsset}
          startTransfer={startTransfer}
          markAsSurplus={markAsSurplus}
          formatDateToDDMMYYYY={formatDateToDDMMYYYY}
        />

        {/* ✅ NEW: Pagination Controls (Bottom) */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow p-4 mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing {startItem}-{endItem} of {total} assets
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => goToPage(1)}
                  disabled={page <= 1}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                >
                  First
                </button>
                <button
                  onClick={goToPrevPage}
                  disabled={page <= 1}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 rounded ${
                        page === pageNum
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={goToNextPage}
                  disabled={page >= totalPages}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                >
                  Next
                </button>
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={page >= totalPages}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default Inventory;