import React, { useState, useEffect } from 'react';
import Header from './common/Header';
import Navigation from './common/Navigation';
import Footer from './common/Footer';

function Reports() {
  const [reportData, setReportData] = useState({
    assetsByDepartment: [],
    assetsNearingShelfLife: [],
    purchaseOrdersByPO: [],
    totalAssets: 0,
    expiredAssets: 0,
    totalPurchaseOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Mock assets data for reports - replace with actual API call
      const mockAssets = [
        {
          id: 1,
          asset_number: "AST001",
          owner_name: "John Doe",
          department: "IT",
          hardware_type: "Laptop",
          replacement_due_date: "2025-02-15",
          po_order_number: "PO001"
        },
        {
          id: 2,
          asset_number: "AST002",
          owner_name: "Jane Smith",
          department: "HR",
          hardware_type: "Desktop",
          replacement_due_date: "2025-01-20",
          po_order_number: "PO002"
        },
        {
          id: 3,
          asset_number: "AST003",
          owner_name: "Mike Johnson",
          department: "Finance",
          hardware_type: "Monitor",
          replacement_due_date: "2024-12-30",
          po_order_number: "PO001"
        },
        {
          id: 4,
          asset_number: "AST004",
          owner_name: "Sarah Wilson",
          department: "IT",
          hardware_type: "Printer",
          replacement_due_date: "2025-06-15",
          po_order_number: "PO003"
        },
        {
          id: 5,
          asset_number: "AST005",
          owner_name: "Tom Brown",
          department: "Operations",
          hardware_type: "Laptop",
          replacement_due_date: "2024-11-10",
          po_order_number: "PO002"
        }
      ];

      // Process data for reports
      const assetsByDepartment = processAssetsByDepartment(mockAssets);
      const assetsNearingShelfLife = processAssetsNearingShelfLife(mockAssets);
      const purchaseOrdersByPO = processPurchaseOrdersByPO(mockAssets);

      setReportData({
        assetsByDepartment,
        assetsNearingShelfLife,
        purchaseOrdersByPO,
        totalAssets: mockAssets.length,
        expiredAssets: getExpiredAssetsCount(mockAssets),
        totalPurchaseOrders: purchaseOrdersByPO.length,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const processAssetsByDepartment = (assets) => {
    const departmentCounts = {};
    assets.forEach((asset) => {
      if (asset.department) {
        departmentCounts[asset.department] =
          (departmentCounts[asset.department] || 0) + 1;
      }
    });

    return Object.entries(departmentCounts)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);
  };

  const processAssetsNearingShelfLife = (assets) => {
    const today = new Date();
    return assets
      .filter((asset) => {
        if (!asset.replacement_due_date) return false;
        const dueDate = new Date(asset.replacement_due_date);
        const diffTime = dueDate - today;
        const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30);
        return diffMonths <= 6 && diffMonths >= 0;
      })
      .sort(
        (a, b) =>
          new Date(a.replacement_due_date) - new Date(b.replacement_due_date)
      );
  };

  const processPurchaseOrdersByPO = (assets) => {
    const poGroups = {};
    assets.forEach((asset) => {
      if (asset.po_order_number) {
        if (!poGroups[asset.po_order_number]) {
          poGroups[asset.po_order_number] = {
            po_number: asset.po_order_number,
            assets: [],
            total_assets: 0,
            departments: new Set(),
            hardware_types: new Set(),
          };
        }
        poGroups[asset.po_order_number].assets.push(asset);
        poGroups[asset.po_order_number].total_assets++;
        poGroups[asset.po_order_number].departments.add(asset.department);
        poGroups[asset.po_order_number].hardware_types.add(asset.hardware_type);
      }
    });

    return Object.values(poGroups)
      .map((po) => ({
        ...po,
        departments: Array.from(po.departments),
        hardware_types: Array.from(po.hardware_types),
      }))
      .sort((a, b) => b.total_assets - a.total_assets);
  };

  const getExpiredAssetsCount = (assets) => {
    const today = new Date();
    return assets.filter((asset) => {
      if (!asset.replacement_due_date) return false;
      return new Date(asset.replacement_due_date) < today;
    }).length;
  };

  const getStatusBadge = (asset) => {
    if (!asset.replacement_due_date) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          No Date Set
        </span>
      );
    }

    const today = new Date();
    const dueDate = new Date(asset.replacement_due_date);
    const diffTime = dueDate - today;
    const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30);

    if (diffMonths < 0) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Expired
        </span>
      );
    } else if (diffMonths < 3) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Critical
        </span>
      );
    } else if (diffMonths < 6) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Warning
        </span>
      );
    } else {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Good
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Reports & Analytics"
        subtitle="Comprehensive asset management insights"
        showRoleSelector={false}
      />
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <i className="fas fa-laptop text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Assets
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.totalAssets}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <i className="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Nearing Shelf-Life
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reportData.assetsNearingShelfLife.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <i className="fas fa-times-circle text-red-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Expired Assets
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {reportData.expiredAssets}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <i className="fas fa-file-invoice text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Purchase Orders
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {reportData.totalPurchaseOrders}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <i className="fas fa-chart-pie mr-2"></i>Overview
              </button>
              <button
                onClick={() => setActiveTab("departments")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "departments"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <i className="fas fa-building mr-2"></i>By Department
              </button>
              <button
                onClick={() => setActiveTab("shelf-life")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "shelf-life"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <i className="fas fa-clock mr-2"></i>Shelf-Life
              </button>
              <button
                onClick={() => setActiveTab("purchase-orders")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "purchase-orders"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <i className="fas fa-file-invoice mr-2"></i>Purchase Orders
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Asset Distribution Overview
                </h3>

                {/* Department Chart */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-800 mb-4">
                    Assets by Department
                  </h4>
                  <div className="space-y-3">
                    {reportData.assetsByDepartment
                      .slice(0, 5)
                      .map((dept, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-32 text-sm text-gray-600">
                            {dept.department}
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-6 mx-4">
                            <div
                              className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                              style={{
                                width: `${
                                  (dept.count / reportData.totalAssets) * 100
                                }%`,
                              }}
                            >
                              <span className="text-white text-xs font-medium">
                                {dept.count}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {(
                              (dept.count / reportData.totalAssets) *
                              100
                            ).toFixed(1)}
                            %
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-800 mb-4">
                      Asset Health Status
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Active Assets
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          {reportData.totalAssets -
                            reportData.expiredAssets -
                            reportData.assetsNearingShelfLife.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Nearing Expiry
                        </span>
                        <span className="text-sm font-medium text-yellow-600">
                          {reportData.assetsNearingShelfLife.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Expired</span>
                        <span className="text-sm font-medium text-red-600">
                          {reportData.expiredAssets}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-800 mb-4">
                      Top Departments
                    </h4>
                    <div className="space-y-2">
                      {reportData.assetsByDepartment
                        .slice(0, 3)
                        .map((dept, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              {dept.department}
                            </span>
                            <span className="text-sm font-medium text-blue-600">
                              {dept.count} assets
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "departments" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Assets by Department
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Assets
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Visual Distribution
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.assetsByDepartment.map((dept, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {dept.department}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {dept.count}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {(
                                (dept.count / reportData.totalAssets) *
                                100
                              ).toFixed(1)}
                              %
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (dept.count / reportData.totalAssets) * 100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "shelf-life" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Assets Nearing Shelf-Life
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Asset Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Owner
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hardware Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Replacement Due
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.assetsNearingShelfLife.map((asset) => (
                        <tr key={asset.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {asset.asset_number}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {asset.owner_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {asset.department}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {asset.hardware_type}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(
                                asset.replacement_due_date
                              ).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(asset)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {reportData.assetsNearingShelfLife.length === 0 && (
                  <div className="text-center py-8">
                    <i className="fas fa-check-circle text-green-400 text-4xl mb-4"></i>
                    <p className="text-gray-500 text-lg">
                      No assets nearing shelf-life
                    </p>
                    <p className="text-gray-400">
                      All assets are within acceptable replacement timeframes
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "purchase-orders" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Purchase Orders Summary
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PO Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Assets
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Departments
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hardware Types
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Visual Distribution
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.purchaseOrdersByPO.map((po, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {po.po_number}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {po.total_assets}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {po.departments.slice(0, 2).join(", ")}
                              {po.departments.length > 2 &&
                                ` +${po.departments.length - 2} more`}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {po.hardware_types.slice(0, 2).join(", ")}
                              {po.hardware_types.length > 2 &&
                                ` +${po.hardware_types.length - 2} more`}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (po.total_assets / reportData.totalAssets) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {reportData.purchaseOrdersByPO.length === 0 && (
                  <div className="text-center py-8">
                    <i className="fas fa-file-invoice text-gray-400 text-4xl mb-4"></i>
                    <p className="text-gray-500 text-lg">
                      No purchase orders found
                    </p>
                    <p className="text-gray-400">
                      Assets without PO numbers are not included in this report
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Reports;