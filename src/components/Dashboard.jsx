import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './common/Header';
import Navigation from './common/Navigation';
import Footer from './common/Footer';
import LoadingSpinner from './common/LoadingSpinner';


// Import the hooks
import { useGetAllAssets } from '../../api/client/asset';
import { useGetAllAssetTransfers } from '../../api/client/assettransfer';
import { useAllCategories } from '../../api/client/category';

function Dashboard() {
  const [userRole, setUserRole] = useState("admin");
  
  // Use the actual hooks for data fetching
  const { 
    data: assets, 
    total: totalAssets, 
    isLoading: assetsLoading, 
    isError: assetsError 
  } = useGetAllAssets({ 
    page: 1, 
    limit: 1000, // Get all assets for dashboard calculations
    search: "", 
    filters: {} 
  });

  const { 
    data: transfers, 
    isLoading: transfersLoading, 
    isError: transfersError 
  } = useGetAllAssetTransfers({ 
    page: 1, 
    limit: 100 // Recent transfers
  });

  const { 
    combinedOptions: categories, 
    isLoading: categoriesLoading, 
    isError: categoriesError 
  } = useAllCategories([
    'department', 
    'hardware_type', 
    'operational_status', 
    'disposition_status'
  ]);

  // Helper function to get option name by ID (same logic as in AssetsTable)
  const getOptionNameById = (id, options = []) => {
    if (!id || !options.length) return id || 'Unknown';
    const matched = options.find(
      (opt) => String(opt.id) === String(id) || String(opt.value) === String(id)
    );
    return matched ? matched.name || matched.label || matched.value : id;
  };

  // Helper function to get department name by ID
  const getDepartmentName = (departmentId) => {
    return getOptionNameById(departmentId, categories?.department || []);
  };

  // Helper function to get hardware type name by ID
  const getHardwareTypeName = (hardwareTypeId) => {
    return getOptionNameById(hardwareTypeId, categories?.hardware_type || []);
  };

  // Helper function to get operational status name by ID
  const getOperationalStatusName = (statusId) => {
    return getOptionNameById(statusId, categories?.operational_status || []);
  };

  // Helper function to get disposition status name by ID
  const getDispositionStatusName = (statusId) => {
    return getOptionNameById(statusId, categories?.disposition_status || []);
  };

  // Calculate metrics from real data
  const calculateMetrics = () => {
    if (!assets || assets.length === 0 || !categories) return null;

    // Basic counts
    const totalAssetsCount = assets.length;
    const activeAssets = assets.filter(asset => {
      const operationalStatusName = getOperationalStatusName(asset.operational_status);
      return operationalStatusName?.toLowerCase() === 'active';
    }).length;

    // Assets with operational status 'expiring soon' filtered by hardware type
    const laptopsNearingShelfLife = assets.filter(asset => {
      const operationalStatusName = getOperationalStatusName(asset.operational_status);
      const hardwareTypeName = getHardwareTypeName(asset.hardware_type);
      return operationalStatusName?.toLowerCase() === 'expiring soon' &&
             hardwareTypeName?.toLowerCase().includes('laptop');
    }).length;

    const desktopsNearingShelfLife = assets.filter(asset => {
      const operationalStatusName = getOperationalStatusName(asset.operational_status);
      const hardwareTypeName = getHardwareTypeName(asset.hardware_type);
      return operationalStatusName?.toLowerCase() === 'expiring soon' &&
             hardwareTypeName?.toLowerCase().includes('desktop');
    }).length;

    // Surplus assets
    const surplus = assets.filter(asset => {
      const dispositionStatusName = getDispositionStatusName(asset.disposition_status);
      return dispositionStatusName?.toLowerCase() === 'surplus';
    }).length;

    // Department distribution - using department names instead of IDs
    const departmentCounts = {};
    assets.forEach(asset => {
      const deptName = getDepartmentName(asset.department);
      departmentCounts[deptName] = (departmentCounts[deptName] || 0) + 1;
    });

    const departmentDistribution = Object.entries(departmentCounts).map(([dept, count], index) => {
      const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];
      return {
        department: dept,
        count: count,
        color: colors[index % colors.length]
      };
    });

    // Spare inventory (assets with disposition status 'is custody')
    const spareAssets = assets.filter(asset => {
      const dispositionStatusName = getDispositionStatusName(asset.disposition_status);
      return dispositionStatusName?.toLowerCase() === 'is custody';
    });

    const laptopSpares = spareAssets.filter(asset => {
      const hardwareTypeName = getHardwareTypeName(asset.hardware_type);
      return hardwareTypeName?.toLowerCase().includes('laptop');
    });
    
    const desktopSpares = spareAssets.filter(asset => {
      const hardwareTypeName = getHardwareTypeName(asset.hardware_type);
      return hardwareTypeName?.toLowerCase().includes('desktop');
    });

    // Group spare inventory by operational status
    const groupSparesByStatus = (spareList) => {
      const grouped = { total: spareList.length, new: 0, used: 0, dead: 0 };
      spareList.forEach(asset => {
        const operationalStatusName = getOperationalStatusName(asset.operational_status);
        const status = operationalStatusName?.toLowerCase();
        if (status === 'new') grouped.new++;
        else if (status === 'used') grouped.used++;
        else if (status === 'dead') grouped.dead++;
      });
      return grouped;
    };

    const spareInventory = {
      laptop: groupSparesByStatus(laptopSpares),
      desktop: groupSparesByStatus(desktopSpares)
    };

    // Operational status breakdown - using status names instead of IDs
    const operationalStatus = {};
    assets.forEach(asset => {
      const statusName = getOperationalStatusName(asset.operational_status);
      operationalStatus[statusName] = (operationalStatus[statusName] || 0) + 1;
    });

    // Disposition status breakdown - using status names instead of IDs
    const dispositionStatus = {};
    assets.forEach(asset => {
      const statusName = getDispositionStatusName(asset.disposition_status);
      dispositionStatus[statusName] = (dispositionStatus[statusName] || 0) + 1;
    });

    const otherAssets = {
      operationalStatus,
      dispositionStatus
    };

    return {
      totalAssets: totalAssetsCount,
      activeAssets,
      laptopsNearingShelfLife,
      desktopsNearingShelfLife,
      surplus,
      departmentDistribution,
      spareInventory,
      otherAssets
    };
  };

  const metrics = calculateMetrics();
  const loading = assetsLoading || transfersLoading || categoriesLoading;
  const error = assetsError || transfersError || categoriesError;

  const PieChart = ({ data, title }) => {
    const dataArray = Object.entries(data).map(([key, value]) => ({
      label: key.replace(/([A-Z])/g, ' $1').trim(),
      count: value,
      color: getColorForStatus(key)
    }));
    
    const total = dataArray.reduce((sum, item) => sum + item.count, 0);
    let currentAngle = 0;
    
    return (
      <div className="relative w-80 h-80 mx-auto">
        <svg viewBox="0 0 240 240" className="w-full h-full">
          {dataArray.map((item, index) => {
            const percentage = (item.count / total) * 100;
            const angle = (item.count / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const x1 = 120 + 85 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 120 + 85 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 120 + 85 * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 120 + 85 * Math.sin((endAngle * Math.PI) / 180);
            const largeArc = angle > 180 ? 1 : 0;
            
            const pathData = `M 120 120 L ${x1} ${y1} A 85 85 0 ${largeArc} 1 ${x2} ${y2} Z`;
            
            // Calculate label position
            const midAngle = startAngle + angle / 2;
            const labelRadius = 105;
            const labelX = 120 + labelRadius * Math.cos((midAngle * Math.PI) / 180);
            const labelY = 120 + labelRadius * Math.sin((midAngle * Math.PI) / 180);
            
            const result = (
              <g key={index}>
                <path
                  d={pathData}
                  fill={item.color}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
                {angle > 15 && (
                  <text 
                    x={labelX} 
                    y={labelY} 
                    textAnchor="middle" 
                    className="text-xs font-semibold fill-gray-700"
                    dominantBaseline="middle"
                  >
                    <tspan x={labelX} dy="-0.3em" className="font-bold">{item.count}</tspan>
                    <tspan x={labelX} dy="1.2em" className="text-xs">{item.label}</tspan>
                  </text>
                )}
              </g>
            );
            
            currentAngle += angle;
            return result;
          })}
          <circle cx="120" cy="120" r="35" fill="white" stroke="#e5e7eb" strokeWidth="2" />
          <text x="120" y="125" textAnchor="middle" className="text-lg font-bold fill-gray-900">
            {total}
          </text>
          <text x="120" y="140" textAnchor="middle" className="text-xs fill-gray-600">
            Total
          </text>
        </svg>
        
        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          {dataArray.map((item, index) => (
            <div key={index} className="flex items-center text-sm">
              <div 
                className="w-4 h-4 rounded mr-2 flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-gray-700 text-xs">
                {item.label}: <span className="font-semibold">{item.count}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getColorForStatus = (status) => {
    const colorMap = {
      active: "#10B981",
      dead: "#EF4444", 
      used: "#F59E0B",
      new: "#3B82F6",
      expired: "#6B7280",
      expiringSoon: "#F97316",
      surplus: "#8B5CF6",
      assigned: "#06B6D4",
      spare: "#F97316"
    };
    return colorMap[status] || "#6B7280";
  };
if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner size="lg" variant="default" text="Loading dashboard..." />
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="All Assets. One Hive."
        subtitle="Welcome Admin"
        userRole={userRole}
        setUserRole={setUserRole}
      />
      
      <Navigation currentPage="dashboard" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Failed to load dashboard data. Please try again.
          </div>
        )}

        

        {/* Main Metrics Cards - Now with 5 cards including Surplus */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="p-4 rounded-full bg-blue-100 inline-block mb-4">
                <i className="fas fa-laptop text-blue-600 text-2xl"></i>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-2">Total Assets</p>
              <p className="text-4xl font-bold text-gray-900">{metrics.totalAssets}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="p-4 rounded-full bg-green-100 inline-block mb-4">
                <i className="fas fa-check-circle text-green-600 text-2xl"></i>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-2">Active Assets</p>
              <p className="text-4xl font-bold text-gray-900">{metrics.activeAssets}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="p-4 rounded-full bg-orange-100 inline-block mb-4">
                <i className="fas fa-laptop text-orange-600 text-2xl"></i>
              </div>
              <p className="text-xs font-medium text-gray-600 mb-2">Laptops Expiring Soon</p>
              <p className="text-4xl font-bold text-orange-600">{metrics.laptopsNearingShelfLife}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="p-4 rounded-full bg-red-100 inline-block mb-4">
                <i className="fas fa-desktop text-red-600 text-2xl"></i>
              </div>
              <p className="text-xs font-medium text-gray-600 mb-2">Desktops Expiring Soon</p>
              <p className="text-4xl font-bold text-red-600">{metrics.desktopsNearingShelfLife}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="p-4 rounded-full bg-purple-100 inline-block mb-4">
                <i className="fas fa-archive text-purple-600 text-2xl"></i>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-2">Surplus Assets</p>
              <p className="text-4xl font-bold text-purple-600">{metrics.surplus}</p>
            </div>
          </div>
        )}

        {/* Charts Section - Department Distribution and IS Spare Inventory */}
        {metrics?.departmentDistribution && metrics?.spareInventory && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Assets by Department</h3>
  <div className="space-y-3">
    {metrics.departmentDistribution.map((dept, index) => {
      // Light, minimal tone colors that still provide good variation
      const lightColors = [
       "#D1E7FD", 
        "#D4F1D4", 
        "#FFE4CC", 
        "#FFD6DA", 
        "#E8D5F0", 
        "#CCE8E3", 
        "#FFF0C4", 
        "#E3F2D3", 
        "#D3DCF2", 
        "#F8D7DA" 
      ];
      
      const borderColors = [
        "#1976D2", // Blue border
        "#388E3C", // Green border
        "#F57C00", // Orange border
        "#D32F2F", // Red border
        "#7B1FA2", // Purple border
        "#00796B", // Teal border
        "#FBC02D", // Amber border
        "#689F38", // Light Green border
        "#303F9F", // Indigo border
        "#C2185B"  // Pink border
      ];
      
      const percentage = Math.round((dept.count / metrics.totalAssets) * 100);
      
      return (
        <div key={index} className="flex items-center gap-3">
          {/* Department Name - Fixed width with proper text handling */}
          <div className="w-32 flex-shrink-0">
            <div 
              className="text-xs font-medium text-gray-700 leading-tight break-words"
              title={dept.department} // Tooltip for full name
            >
              {dept.department}
            </div>
          </div>
          
          {/* Progress Bar Container */}
          <div className="flex-1 bg-gray-100 rounded-lg h-10 relative min-w-0">
            <div
              className="h-10 rounded-lg transition-all duration-700 ease-out border-l-4"
              style={{
                width: `${Math.max(percentage, 8)}%`, // Minimum 8% width for visibility
                backgroundColor: lightColors[index % lightColors.length],
                borderLeftColor: borderColors[index % borderColors.length]
              }}
            >
              {/* Inner shadow effect for depth */}
              <div className="absolute inset-0 rounded-lg shadow-inner opacity-20"></div>
            </div>
          </div>
          
          {/* Count and Percentage - Dedicated space */}
          <div className="w-20 flex-shrink-0 text-right">
            <div className="text-sm font-bold text-gray-900">
              {dept.count}
            </div>
            <div className="text-xs text-gray-500">
              {percentage}%
            </div>
          </div>
        </div>
      );
    })}
  </div>
  
  {/* Summary at bottom */}
  <div className="mt-6 pt-4 border-t border-gray-200">
    <div className="flex justify-between items-center text-sm">
      <span className="font-medium text-gray-700">
        Total Departments: {metrics.departmentDistribution.length}
      </span>
      <span className="font-medium text-gray-700">
        Total Assets: {metrics.totalAssets}
      </span>
    </div>
  </div>
</div>
            {/* IS Spare Inventory */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Information Systems Inventory</h3>
              <div className="grid grid-cols-2 gap-6">
                {/* Laptop Column */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div className="text-center mb-4">
                    <div className="p-3 rounded-full bg-blue-100 inline-block mb-2">
                      <i className="fas fa-laptop text-blue-600 text-xl"></i>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Laptop</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="text-sm font-medium text-gray-700">Total</span>
                      <span className="text-lg font-bold text-gray-900">{metrics.spareInventory.laptop.total}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="text-sm font-medium text-gray-700">New</span>
                      <span className="text-lg font-bold text-blue-600">{metrics.spareInventory.laptop.new}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="text-sm font-medium text-gray-700">Used</span>
                      <span className="text-lg font-bold text-amber-600">{metrics.spareInventory.laptop.used}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="text-sm font-medium text-gray-700">Dead</span>
                      <span className="text-lg font-bold text-red-600">{metrics.spareInventory.laptop.dead}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Column */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                  <div className="text-center mb-4">
                    <div className="p-3 rounded-full bg-green-100 inline-block mb-2">
                      <i className="fas fa-desktop text-green-600 text-xl"></i>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Desktop</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="text-sm font-medium text-gray-700">Total</span>
                      <span className="text-lg font-bold text-gray-900">{metrics.spareInventory.desktop.total}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="text-sm font-medium text-gray-700">New</span>
                      <span className="text-lg font-bold text-blue-600">{metrics.spareInventory.desktop.new}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="text-sm font-medium text-gray-700">Used</span>
                      <span className="text-lg font-bold text-amber-600">{metrics.spareInventory.desktop.used}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="text-sm font-medium text-gray-700">Dead</span>
                      <span className="text-lg font-bold text-red-600">{metrics.spareInventory.desktop.dead}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Assets Status Overview - No Tabs */}
        {metrics?.otherAssets && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-8">
              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">Complete Assets Status Overview</h3>
                  <p className="text-gray-600 mt-2">Comprehensive operational and disposition status breakdown for all assets</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Operational Status */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
                    <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">Operational Status</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(metrics.otherAssets.operationalStatus).map(([key, value], index) => {
                        const colors = [
                          'from-emerald-400 to-emerald-600',
                          'from-red-400 to-red-600',
                          'from-amber-400 to-amber-600',
                          'from-sky-400 to-sky-600',
                          'from-slate-400 to-slate-600',
                          'from-orange-400 to-orange-600'
                        ];
                        return (
                          <div key={key} className="text-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <div className={`text-3xl font-bold bg-gradient-to-r ${colors[index % colors.length]} bg-clip-text text-transparent`}>
                              {value}
                            </div>
                            <div className="text-sm text-gray-600 mt-2 font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Disposition Status */}
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-100">
                    <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">Disposition Status</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(metrics.otherAssets.dispositionStatus).map(([key, value], index) => {
                        const colors = [
                          'from-rose-400 to-rose-600',
                          'from-violet-400 to-violet-600',
                          'from-teal-400 to-teal-600',
                          'from-fuchsia-400 to-fuchsia-600',
                          'from-cyan-400 to-cyan-600',
                          'from-lime-400 to-lime-600'
                        ];
                        return (
                          <div key={key} className="text-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <div className={`text-3xl font-bold bg-gradient-to-r ${colors[index % colors.length]} bg-clip-text text-transparent`}>
                              {value}
                            </div>
                            <div className="text-sm text-gray-600 mt-2 font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;