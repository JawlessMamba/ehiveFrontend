import React, { memo, useCallback, useMemo } from "react";

// Mock data for demonstration
const mockUser = {
  role: "admin"
};

const mockAssetDropdownOptions = {
  model_number: [
    { id: 1, value: "Dell OptiPlex 7090" },
    { id: 2, value: "HP EliteBook 840" },
    { id: 3, value: "Lenovo ThinkPad T14" },
    { id: 4, value: "HP LaserJet Pro" },
    { id: 5, value: "Cisco Catalyst 2960" }
  ],
  vendor: [
    { id: 1, value: "Dell Technologies" },
    { id: 2, value: "HP Inc." },
    { id: 3, value: "Lenovo" },
    { id: 4, value: "Cisco Systems" },
    { id: 5, value: "Microsoft" }
  ],
  operational_status: [
    { id: 1, value: "active" },
    { id: 2, value: "inactive" },
    { id: 3, value: "maintenance" },
    { id: 4, value: "surplus" }
  ],
  disposition_status: [
    { id: 1, value: "assigned" },
    { id: 2, value: "available" },
    { id: 3, value: "disposed" },
    { id: 4, value: "transferred" }
  ]
};

// ✅ OPTIMIZED: Memoized status colors for consistent rendering
const STATUS_COLORS = [
  "#D1E7FD", "#D4F1D4", "#FFE4CC", "#FFD6DA", "#E8D5F0", 
  "#CCE8E3", "#FFF0C4", "#E3F2D3", "#D3DCF2", "#F8D7DA"
];

const getTextColor = () => "#1F2937"; // Dark gray for all light backgrounds

// ✅ OPTIMIZED: Memoized status color function
const getStatusColor = (() => {
  const statusColorMap = new Map();
  let colorIndex = 0;

  return (status) => {
    if (!status) return { bg: "#F3F4F6", text: "#6B7280" };
    
    const normalizedStatus = status.toLowerCase().trim();
    
    if (!statusColorMap.has(normalizedStatus)) {
      const bgColor = STATUS_COLORS[colorIndex % STATUS_COLORS.length];
      const textColor = getTextColor(bgColor);
      
      statusColorMap.set(normalizedStatus, { bg: bgColor, text: textColor });
      colorIndex++;
    }

    return statusColorMap.get(normalizedStatus);
  };
})();

// Mock delete function
const mockDeleteAsset = {
  mutate: (assetId) => {
    console.log(`Mock: Deleting asset with ID: ${assetId}`);
    // Simulate API call delay
    setTimeout(() => {
      alert(`Asset ${assetId} deleted successfully!`);
    }, 500);
  },
  isLoading: false
};

// ✅ OPTIMIZED: Memoized table row component
const AssetTableRow = memo(({ 
  asset, 
  isEditing, 
  editingAsset,
  onEdit, 
  onSave, 
  onCancel, 
  onTransfer, 
  onSurplus, 
  onDelete,
  onInputChange,
  formatDate,
  categories,
  assetDropdownOptions,
  userRole
}) => {
  const safeGetValue = useCallback((assetData, key, fallback = "") => {
    return assetData && assetData[key] !== undefined && assetData[key] !== null
      ? assetData[key]
      : fallback;
  }, []);

  // ✅ NEW: Delete confirmation handler
  const handleDeleteWithConfirm = useCallback((assetId) => {
    if (window.confirm("Are you sure?")) {
      onDelete(assetId);
    }
  }, [onDelete]);

  const renderInputField = useCallback((field, type = "text") => {
    const value = safeGetValue(isEditing ? editingAsset : asset, field);

    if (!isEditing) {
      if (type === "date") {
        return (
          <div className="text-xs font-medium text-gray-900 truncate">
            {formatDate(value)}
          </div>
        );
      }
      return (
        <div className="text-xs font-medium text-gray-900 truncate" title={value}>
          {value}
        </div>
      );
    }

    return (
      <input
        type={type}
        value={value}
        onChange={(e) => onInputChange(field, e.target.value)}
        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        placeholder={`Enter ${field.replace("_", " ")}`}
      />
    );
  }, [isEditing, editingAsset, asset, safeGetValue, formatDate, onInputChange]);

  const renderSelectField = useCallback((field, options = []) => {
    const value = safeGetValue(isEditing ? editingAsset : asset, field);

    if (!isEditing) {
      return (
        <div className="text-xs font-medium text-gray-900 truncate" title={value}>
          {value || ''}
        </div>
      );
    }

    return (
      <select
        value={value || ''}
        onChange={(e) => onInputChange(field, e.target.value)}
        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select {field.replace("_", " ")}</option>
        {options.map((option) => (
          <option key={option.id || option.value} value={option.value}>
            {option.value}
          </option>
        ))}
      </select>
    );
  }, [isEditing, editingAsset, asset, safeGetValue, onInputChange]);

  const renderStatusBadge = useCallback((field, options = []) => {
    const value = safeGetValue(asset, field);
    const displayName = value;
    
    if (!displayName) {
      return <div className="text-xs font-medium text-gray-500">-</div>;
    }

    const colors = getStatusColor(displayName);

    return (
      <span
        className="inline-flex px-2 py-1 text-xs font-semibold rounded-full truncate"
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          maxWidth: '80px'
        }}
        title={displayName}
      >
        {displayName}
      </span>
    );
  }, [asset, safeGetValue]);

  const renderActionButtons = useCallback(() => {
    if (isEditing) {
      return (
        <div className="flex space-x-1">
          <button
            onClick={onSave}
            className="text-green-600 hover:text-green-900 p-1 transition-colors"
            title="Save Changes"
          >
            <i className="fas fa-check"></i>
          </button>
          <button
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-900 p-1 transition-colors"
            title="Cancel Edit"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      );
    }

    return (
      <div className="flex space-x-1">
        <button
          onClick={() => onEdit(asset)}
          className="text-blue-600 hover:text-blue-900 p-1 transition-colors"
          title="Edit Asset"
        >
          <i className="fas fa-edit"></i>
        </button>
        <button
          onClick={() => onTransfer(asset)}
          className="text-green-600 hover:text-green-900 p-1 transition-colors"
          title="Transfer Asset"
        >
          <i className="fas fa-exchange-alt"></i>
        </button>
        <button
          onClick={() => onSurplus(asset?.id)}
          className="text-orange-600 hover:text-orange-900 font-bold p-1 transition-colors"
          title="Mark as Surplus"
          disabled={!asset?.id}
        >
          S
        </button>
        
        {userRole === "admin" && (
          <button
            onClick={() => handleDeleteWithConfirm(asset?.id)}
            className="text-red-600 hover:text-red-900 p-1 transition-colors"
            title="Delete Asset"
            disabled={!asset?.id}
          >
            <i className="fas fa-trash"></i>
          </button>
        )}
      </div>
    );
  }, [isEditing, onSave, onCancel, onEdit, onTransfer, onSurplus, handleDeleteWithConfirm, asset, userRole]);

  return (
    <tr
      className={`hover:bg-gray-50 transition-colors ${
        safeGetValue(asset, "operational_status") === "surplus"
          ? "bg-red-50 border-l-4 border-red-500"
          : ""
      }`}
    >
      {/* Asset ID */}
      <td className="px-3 py-2 whitespace-nowrap">
        {renderInputField("asset_id")}
      </td>

      {/* Serial Number */}
      <td className="px-3 py-2 whitespace-nowrap">
        {renderInputField("serial_number")}
      </td>

      {/* Hostname */}
      <td className="px-3 py-2 whitespace-nowrap">
        {renderInputField("hostname")}
      </td>

      {/* Hardware Type */}
      <td className="px-3 py-2 whitespace-nowrap">
        {renderSelectField("hardware_type", categories?.hardware_type || [])}
      </td>

      {/* Model Number */}
      <td className="px-3 py-2 whitespace-nowrap">
        {renderSelectField("model_number", assetDropdownOptions?.model_number || [])}
      </td>

      {/* Owner Full Name */}
      <td className="px-3 py-2 whitespace-nowrap">
        {renderInputField("owner_fullname")}
      </td>

      {/* P Number */}
      <td className="px-3 py-2 whitespace-nowrap">
        {renderInputField("p_number")}
      </td>

      {/* Cadre */}
      <td className="px-3 py-2 whitespace-nowrap">
        {renderSelectField("cadre", categories?.cadre || [])}
      </td>

      {/* Section */}
      <td className="px-3 py-2 whitespace-nowrap">
        {renderSelectField("section", categories?.section || [])}
      </td>

      {/* Department */}
      <td className="px-3 py-2 whitespace-nowrap">
        {renderSelectField("department", categories?.department || [])}
      </td>

      {/* Assigned Date */}
      <td className="px-3 py-2 whitespace-nowrap">
        {renderInputField("assigned_date", "date")}
      </td>

      {/* Building */}
      <td className="px-3 py-2 whitespace-nowrap">
        {renderSelectField("building", categories?.building || [])}
      </td>

      {/* Purchase Order */}
      <td className="px-3 py-2 whitespace-nowrap">
        {renderInputField("po_number")}
      </td>

      {/* PO Date */}
      <td className="px-3 py-2 whitespace-nowrap">
        {renderInputField("po_date", "date")}
      </td>

      {/* Delivery Challan */}
      <td className="px-3 py-2 whitespace-nowrap">
        {renderInputField("dc_number")}
      </td>

      {/* DC Date */}
      <td className="px-3 py-2 whitespace-nowrap">
        {renderInputField("dc_date", "date")}
      </td>

      {/* Vendor */}
      <td className="px-3 py-2 whitespace-nowrap">
        {renderSelectField("vendor", assetDropdownOptions?.vendor || [])}
      </td>

      {/* Operational Status */}
      <td className="px-3 py-2 whitespace-nowrap">
        {isEditing
          ? renderSelectField("operational_status", assetDropdownOptions?.operational_status || [])
          : renderStatusBadge("operational_status", assetDropdownOptions?.operational_status || [])
        }
      </td>

      {/* Disposition Status */}
      <td className="px-3 py-2 whitespace-nowrap">
        {isEditing
          ? renderSelectField("disposition_status", assetDropdownOptions?.disposition_status || [])
          : renderStatusBadge("disposition_status", assetDropdownOptions?.disposition_status || [])
        }
      </td>

      {/* Actions */}
      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
        {renderActionButtons()}
      </td>
    </tr>
  );
});

AssetTableRow.displayName = 'AssetTableRow';

// ✅ OPTIMIZED: Main AssetsTable component
const AssetsTable = memo(({
  filteredAssets = [],
  editingAsset,
  setEditingAsset,
  categories = {},
  userRole = "user",
  sortConfig = { key: null, direction: "asc" },
  handleSort,
  startEditing,
  cancelEditing,
  saveAsset,
  startTransfer,
  markAsSurplus,
  formatDateToDDMMYYYY,
}) => {
  console.log(`🔄 AssetsTable rendering ${filteredAssets.length} assets`);

  // ✅ OPTIMIZED: Memoized columns configuration
  const columns = useMemo(() => [
    { key: "asset_id", label: "Asset ID", width: "8%" },
    { key: "serial_number", label: "Serial #", width: "8%" },
    { key: "hostname", label: "Hostname", width: "10%" },
    { key: "hardware_type", label: "Hardware Type", width: "7%" },
    { key: "model_number", label: "Model", width: "9%" },
    { key: "owner_fullname", label: "Owner", width: "9%" },
    { key: "p_number", label: "P #", width: "8%" },
    { key: "cadre", label: "Cadre", width: "7%" },
    { key: "section", label: "Section", width: "7%" },
    { key: "department", label: "Dept", width: "6%" },
    { key: "assigned_date", label: "Assigned Date", width: "7%" },
    { key: "building", label: "Building", width: "7%" },
    { key: "po_number", label: "PO #", width: "7%" },
    { key: "po_date", label: "PO Date", width: "6%" },
    { key: "dc_number", label: "DC #", width: "7%" },
    { key: "dc_date", label: "DC Date", width: "6%" },
    { key: "vendor", label: "Vendor", width: "8%" },
    { key: "operational_status", label: "Op. Status", width: "8%" },
    { key: "disposition_status", label: "Disp. Status", width: "8%" },
  ], []);

  // ✅ OPTIMIZED: Handle input changes
  const handleInputChange = useCallback((field, value) => {
    if (setEditingAsset && typeof setEditingAsset === "function") {
      setEditingAsset((prev) => (prev ? { ...prev, [field]: value } : null));
    }
  }, [setEditingAsset]);

  // ✅ OPTIMIZED: Handle sort click
  const handleSortClick = useCallback((columnKey) => {
    if (handleSort && typeof handleSort === "function") {
      handleSort(columnKey);
    }
  }, [handleSort]);

  // ✅ OPTIMIZED: Safe format date function
  const safeFormatDate = useCallback((dateValue) => {
    if (!dateValue) return "";
    try {
      return formatDateToDDMMYYYY ? formatDateToDDMMYYYY(dateValue) : dateValue;
    } catch (error) {
      console.warn("Date formatting error:", error);
      return dateValue;
    }
  }, [formatDateToDDMMYYYY]);

  // Mock delete function
  const handleDelete = useCallback((assetId) => {
    mockDeleteAsset.mutate(assetId);
  }, []);

  // ✅ OPTIMIZED: Memoized table header
  const renderTableHeader = useMemo(() => (
    <thead className="bg-gray-700 sticky top-0 z-10">
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-gray-600 min-w-[80px] transition-colors"
            onClick={() => handleSortClick(column.key)}
            style={{ width: column.width }}
          >
            <div className="flex items-center">
              {column.label}
              {sortConfig?.key === column.key && (
                <i
                  className={`fas fa-sort-${
                    sortConfig.direction === "asc" ? "up" : "down"
                  } ml-1`}
                ></i>
              )}
            </div>
          </th>
        ))}
        <th
          className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[100px]"
          style={{ width: "6%" }}
        >
          Actions
        </th>
      </tr>
    </thead>
  ), [columns, sortConfig, handleSortClick]);

  // ✅ Loading states (removed since no APIs)
  
  // ✅ Early return for invalid data
  if (!Array.isArray(filteredAssets)) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <i className="fas fa-exclamation-triangle text-yellow-400 text-4xl mb-4"></i>
        <p className="text-gray-500 text-lg">Invalid data format</p>
        <p className="text-gray-400">Please check your data source</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Assets Management
        </h3>
        <p className="text-sm text-gray-600">
          Manage and track organizational assets ({filteredAssets.length} items)
        </p>
      </div>

      {/* ✅ OPTIMIZED: Table Container with Virtual Scrolling consideration */}
      <div className="overflow-x-auto overflow-y-auto max-h-96 border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          {renderTableHeader}
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAssets.map((asset) => {
              if (!asset || typeof asset !== "object") {
                console.warn("Invalid asset object:", asset);
                return null;
              }

              return (
                <AssetTableRow
                  key={asset.id || `asset-${Math.random()}`}
                  asset={asset}
                  isEditing={editingAsset?.id === asset?.id}
                  editingAsset={editingAsset}
                  onEdit={startEditing}
                  onSave={saveAsset}
                  onCancel={cancelEditing}
                  onTransfer={startTransfer}
                  onSurplus={markAsSurplus}
                  onDelete={handleDelete}
                  onInputChange={handleInputChange}
                  formatDate={safeFormatDate}
                  categories={categories}
                  assetDropdownOptions={mockAssetDropdownOptions}
                  userRole={mockUser?.role || userRole}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ OPTIMIZED: Empty state */}
      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-inbox text-gray-400 text-4xl mb-4"></i>
          <p className="text-gray-500 text-lg">No assets found</p>
          <p className="text-gray-400">
            Try adjusting your filters or add new assets
          </p>
        </div>
      )}
    </div>
  );
});

AssetsTable.displayName = 'AssetsTable';

export default AssetsTable;