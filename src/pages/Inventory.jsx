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

// Dummy data for demonstration
const DUMMY_ASSETS = [
  {
    id: 1,
    asset_id: "AST001234",
    serial_number: "LAP001234",
    hardware_type: "Laptop",
    model_number: "Dell Latitude 7420",
    owner_fullname: "John Smith",
    hostname: "LAPTOP-JS001",
    p_number: "P001234",
    cadre: "Officer",
    department: "IT Support",
    section: "Hardware",
    building: "Main Building",
    vendor: "Dell Technologies",
    po_number: "PO-2024-001",
    po_date: "2024-01-15T00:00:00Z",
    dc_number: "DC-2024-001",
    dc_date: "2024-02-01T00:00:00Z",
    assigned_date: "2024-02-05T00:00:00Z",
    replacement_due_period: "5 Years",
    replacement_due_date: "2029-02-05T00:00:00Z",
    operational_status: "Active",
    disposition_status: "In Use"
  },
  {
    id: 2,
    asset_id: "AST005678",
    serial_number: "DES005678",
    hardware_type: "Desktop",
    model_number: "HP EliteDesk 800",
    owner_fullname: "Sarah Johnson",
    hostname: "DESKTOP-SJ002",
    p_number: "P005678",
    cadre: "Manager",
    department: "Finance",
    section: "Accounting",
    building: "Finance Block",
    vendor: "HP Inc.",
    po_number: "PO-2024-002",
    po_date: "2024-03-20T00:00:00Z",
    dc_number: "DC-2024-002",
    dc_date: "2024-04-05T00:00:00Z",
    assigned_date: "2024-04-10T00:00:00Z",
    replacement_due_period: "4 Years",
    replacement_due_date: "2028-04-10T00:00:00Z",
    operational_status: "Active",
    disposition_status: "In Use"
  },
  {
    id: 3,
    asset_id: "AST009876",
    serial_number: "MON009876",
    hardware_type: "Monitor",
    model_number: "Samsung 27-inch",
    owner_fullname: "Mike Wilson",
    hostname: "N/A",
    p_number: "P009876",
    cadre: "Staff",
    department: "Marketing",
    section: "Digital",
    building: "Marketing Wing",
    vendor: "Samsung Electronics",
    po_number: "PO-2024-003",
    po_date: "2024-05-10T00:00:00Z",
    dc_number: "DC-2024-003",
    dc_date: "2024-05-25T00:00:00Z",
    assigned_date: "2024-06-01T00:00:00Z",
    replacement_due_period: "6 Years",
    replacement_due_date: "2030-06-01T00:00:00Z",
    operational_status: "Active",
    disposition_status: "In Use"
  }
];

// Dummy filter options
const DUMMY_FILTER_OPTIONS = {
  departments: ["IT Support", "Finance", "Marketing", "HR", "Engineering"],
  hardware_types: ["Laptop", "Desktop", "Monitor", "Printer", "Server"],
  cadres: ["Officer", "Manager", "Staff", "Executive"],
  buildings: ["Main Building", "Finance Block", "Marketing Wing", "IT Center"],
  sections: ["Hardware", "Software", "Accounting", "Digital", "Recruitment"],
  operational_statuses: ["Active", "Inactive", "Maintenance"],
  disposition_statuses: ["In Use", "Available", "Surplus", "Under Repair"]
};

// Dummy categories
const DUMMY_CATEGORIES = {
  department: DUMMY_FILTER_OPTIONS.departments,
  section: DUMMY_FILTER_OPTIONS.sections,
  hardware_type: DUMMY_FILTER_OPTIONS.hardware_types,
  cadre: DUMMY_FILTER_OPTIONS.cadres,
  building: DUMMY_FILTER_OPTIONS.buildings
};

function Inventory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('admin');
  const [editingAsset, setEditingAsset] = useState(null);
  const [transferringAsset, setTransferringAsset] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [checkingExpiry, setCheckingExpiry] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  
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
    limit: 50,
  });

  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "desc",
  });

  // Simulate filtered and paginated data
  const { assets, total, page, limit, fetched } = useMemo(() => {
    let filteredData = [...DUMMY_ASSETS];

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filteredData = filteredData.filter(asset =>
        asset.asset_id?.toLowerCase().includes(searchLower) ||
        asset.serial_number?.toLowerCase().includes(searchLower) ||
        asset.hardware_type?.toLowerCase().includes(searchLower) ||
        asset.owner_fullname?.toLowerCase().includes(searchLower) ||
        asset.department?.toLowerCase().includes(searchLower) ||
        asset.model_number?.toLowerCase().includes(searchLower)
      );
    }

    // Apply other filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && !['search', 'page', 'limit', 'po_date_from', 'po_date_to', 'assigned_date_from', 'assigned_date_to', 'dc_date_from', 'dc_date_to'].includes(key)) {
        filteredData = filteredData.filter(asset => 
          asset[key]?.toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    // Apply sorting
    filteredData.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      if (sortConfig.direction === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const totalRecords = filteredData.length;
    const currentPage = filters.page;
    const pageLimit = filters.limit;

    // Apply pagination
    const startIndex = (currentPage - 1) * pageLimit;
    const endIndex = startIndex + pageLimit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      assets: paginatedData,
      total: totalRecords,
      page: currentPage,
      limit: pageLimit,
      fetched: totalRecords
    };
  }, [searchQuery, filters, sortConfig]);

  const formatDateToDDMMYYYY = useCallback((dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    if (key === 'search') {
      setSearchQuery(value);
      setFilters(prev => ({
        ...prev,
        search: value,
        page: 1,
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: value,
        page: key === 'page' ? value : 1,
      }));
    }
  }, []);

  const handleSearch = useCallback((searchValue) => {
    setIsFetching(true);
    setTimeout(() => {
      setSearchQuery(searchValue);
      setFilters(prev => ({
        ...prev,
        search: searchValue,
        page: 1
      }));
      setIsFetching(false);
    }, 500);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
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

  const goToPage = useCallback((pageNumber) => {
    handleFilterChange('page', pageNumber);
  }, [handleFilterChange]);

  const goToNextPage = useCallback(() => {
    const totalPages = Math.ceil(total / limit);
    if (page < totalPages) {
      handleFilterChange('page', page + 1);
    }
  }, [page, total, limit, handleFilterChange]);

  const goToPrevPage = useCallback(() => {
    if (page > 1) {
      handleFilterChange('page', page - 1);
    }
  }, [page, handleFilterChange]);

  const handleCheckExpiringAssets = useCallback(() => {
    setCheckingExpiry(true);
    setTimeout(() => {
      setCheckingExpiry(false);
      // Simulate toast notification
      alert('Expiry check completed! 0 assets updated to "Nearing Replacement"');
    }, 2000);
  }, []);

  // Export functions
  const generatePDF = useCallback((exportData) => {
    try {
      const doc = new jsPDF('landscape', 'mm', 'a3');
      doc.setFontSize(18);
      doc.text('Asset Inventory Report', 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);
      doc.text(`Total Assets: ${exportData.length}`, 14, 32);
      
      const headers = [
        'ID', 'Asset ID', 'Serial Number', 'Hardware Type', 'Model Number', 'Owner Name', 'Hostname',
        'P Number', 'Cadre', 'Department', 'Section', 'Building', 'Vendor',
        'PO Number', 'PO Date', 'DC Number', 'DC Date', 'Assigned Date',
        'Replacement Due Period', 'Replacement Due Date', 'Operational Status', 'Disposition Status'
      ];
      
      const columnWidths = [8, 16, 20, 16, 18, 20, 24, 16, 16, 16, 14, 16, 20, 16, 14, 16, 14, 14, 20, 16, 18, 18];
      const startX = 8;
      const rowHeight = 6;

      let yPosition = 39;

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

        if (rowIndex % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          let currentX = startX;
          headers.forEach((_, index) => {
            doc.rect(currentX, yPosition, columnWidths[index], rowHeight, 'F');
            currentX += columnWidths[index];
          });
        }

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
      alert(`PDF exported successfully with ${exportData.length} assets!`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF');
    }
  }, [formatDateToDDMMYYYY]);

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
      alert(`CSV exported successfully with ${exportData.length} assets!`);
    } catch (error) {
      console.error('CSV generation error:', error);
      alert('Failed to generate CSV');
    }
  }, [formatDateToDDMMYYYY]);

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
      alert(`Excel exported successfully with ${exportData.length} assets!`);
    } catch (error) {
      console.error('Excel generation error:', error);
      alert('Failed to generate Excel file');
    }
  }, [formatDateToDDMMYYYY]);

  const exportToPDF = useCallback(async () => {
    if (exportLoading) return;
    
    setExportLoading(true);
    setTimeout(() => {
      // Use currently filtered data for export
      const allFilteredData = [...DUMMY_ASSETS].filter(asset => {
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          return asset.asset_id?.toLowerCase().includes(searchLower) ||
                 asset.serial_number?.toLowerCase().includes(searchLower) ||
                 asset.hardware_type?.toLowerCase().includes(searchLower) ||
                 asset.owner_fullname?.toLowerCase().includes(searchLower) ||
                 asset.department?.toLowerCase().includes(searchLower) ||
                 asset.model_number?.toLowerCase().includes(searchLower);
        }
        return true;
      });
      
      generatePDF(allFilteredData);
      setExportLoading(false);
    }, 1000);
  }, [exportLoading, generatePDF, searchQuery]);

  const exportToCSV = useCallback(async () => {
    if (exportLoading) return;
    
    setExportLoading(true);
    setTimeout(() => {
      const allFilteredData = [...DUMMY_ASSETS].filter(asset => {
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          return asset.asset_id?.toLowerCase().includes(searchLower) ||
                 asset.serial_number?.toLowerCase().includes(searchLower) ||
                 asset.hardware_type?.toLowerCase().includes(searchLower) ||
                 asset.owner_fullname?.toLowerCase().includes(searchLower) ||
                 asset.department?.toLowerCase().includes(searchLower) ||
                 asset.model_number?.toLowerCase().includes(searchLower);
        }
        return true;
      });
      
      generateCSV(allFilteredData);
      setExportLoading(false);
    }, 1000);
  }, [exportLoading, generateCSV, searchQuery]);

  const exportToXLSX = useCallback(async () => {
    if (exportLoading) return;
    
    setExportLoading(true);
    setTimeout(() => {
      const allFilteredData = [...DUMMY_ASSETS].filter(asset => {
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          return asset.asset_id?.toLowerCase().includes(searchLower) ||
                 asset.serial_number?.toLowerCase().includes(searchLower) ||
                 asset.hardware_type?.toLowerCase().includes(searchLower) ||
                 asset.owner_fullname?.toLowerCase().includes(searchLower) ||
                 asset.department?.toLowerCase().includes(searchLower) ||
                 asset.model_number?.toLowerCase().includes(searchLower);
        }
        return true;
      });
      
      generateExcel(allFilteredData);
      setExportLoading(false);
    }, 1000);
  }, [exportLoading, generateExcel, searchQuery]);

  const handleExportSelect = useCallback((format) => {
    setShowExportDropdown(false);
    switch (format) {
      case 'pdf': exportToPDF(); break;
      case 'csv': exportToCSV(); break;
      case 'xlsx': exportToXLSX(); break;
      default: break;
    }
  }, [exportToPDF, exportToCSV, exportToXLSX]);

  const startEditing = useCallback((asset) => {
    setEditingAsset({ ...asset });
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingAsset(null);
  }, []);

  const saveAsset = useCallback(() => {
    if (!editingAsset) return;

    setUpdateLoading(true);
    setTimeout(() => {
      // Simulate save success
      setEditingAsset(null);
      setError(null);
      setUpdateLoading(false);
      alert('Asset updated successfully!');
    }, 1000);
  }, [editingAsset]);

  const markAsSurplus = useCallback((assetId) => {
    if (!window.confirm("Are you sure you want to mark this asset as surplus?")) return;
    
    setTimeout(() => {
      alert(`Asset ${assetId} marked as surplus successfully!`);
    }, 500);
  }, []);

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
    alert('Asset transferred successfully!');
  }, []);

  if (isLoading && !assets?.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner 
          size="xl" 
          text="Loading Inventory Assets..."
        />
      </div>
    );
  }

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
          categories={DUMMY_CATEGORIES}
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
        
        <FilterBar
          filters={filters}
          handleFilterChange={handleFilterChange}
          clearFilters={clearFilters}
          filterOptions={DUMMY_FILTER_OPTIONS}
          filteredAssets={assets}
          showExportDropdown={showExportDropdown}
          setShowExportDropdown={setShowExportDropdown}
          handleExportSelect={handleExportSelect}
          total={total}
          fetched={fetched}
          onSearch={handleSearch}
          isLoading={false}
          checkExpiringAssets={handleCheckExpiringAssets}
          checkingExpiry={checkingExpiry}
        />

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
        
        <AssetsTable
          filteredAssets={assets}
          editingAsset={editingAsset}
          setEditingAsset={setEditingAsset}
          categories={DUMMY_CATEGORIES}
          userRole={userRole}
          sortConfig={sortConfig}
          handleSort={() => {}}
          startEditing={startEditing}
          cancelEditing={cancelEditing}
          saveAsset={saveAsset}
          startTransfer={startTransfer}
          markAsSurplus={markAsSurplus}
          formatDateToDDMMYYYY={formatDateToDDMMYYYY}
        />

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

        {/* Demo Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-blue-600 text-xl"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Demo Version
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>This is a demo version with sample data for demonstration purposes</li>
                  <li>All functionality works including search, filtering, sorting, and export features</li>
                  <li>Transfer and edit operations show confirmation messages but don't modify actual data</li>
                  <li>PDF, CSV, and Excel exports work with the sample data</li>
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

export default Inventory;