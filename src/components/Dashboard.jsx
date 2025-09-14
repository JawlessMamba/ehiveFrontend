import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from './common/Header';
import Navigation from './common/Navigation';
import Footer from './common/Footer';

// Dummy data for dashboard
const DUMMY_ASSETS = [
  {
    id: 1,
    asset_id: "ENG-LAP-001",
    serial_number: "SN123456789",
    hardware_type: "Laptop",
    model_number: "Dell Latitude 5520",
    owner_fullname: "John Smith",
    p_number: "P12345",
    cadre: "Senior Officer",
    department: "Engineering",
    section: "Software Development",
    building: "Main Office",
    vendor: "Dell Technologies",
    po_number: "PO-2024-001",
    po_date: "2024-01-15",
    dc_number: "DC-2024-001",
    dc_date: "2024-01-20",
    assigned_date: "2024-01-25",
    replacement_due_period: "3 Years",
    replacement_due_date: "2027-01-25",
    operational_status: "Active",
    disposition_status: "Assigned"
  },
  {
    id: 2,
    asset_id: "ENG-DSK-002",
    serial_number: "SN987654321",
    hardware_type: "Desktop",
    model_number: "HP Elite 800 G9",
    owner_fullname: "Sarah Johnson",
    p_number: "P54321",
    cadre: "Manager",
    department: "Finance",
    section: "Accounting",
    building: "Corporate Tower",
    vendor: "HP Inc",
    po_number: "PO-2024-002",
    po_date: "2024-02-10",
    dc_number: "DC-2024-002",
    dc_date: "2024-02-15",
    assigned_date: "2024-02-20",
    replacement_due_period: "4 Years",
    replacement_due_date: "2028-02-20",
    operational_status: "Active",
    disposition_status: "Assigned"
  },
  // Add more dummy assets for better metrics
  {
    id: 3,
    asset_id: "ENG-LAP-003",
    serial_number: "SN555666777",
    hardware_type: "Laptop",
    model_number: "MacBook Pro M2",
    owner_fullname: "Mike Wilson",
    p_number: "P11111",
    cadre: "Executive",
    department: "Marketing",
    section: "Digital Marketing",
    building: "Main Office",
    vendor: "Apple Inc",
    po_number: "PO-2024-003",
    po_date: "2024-03-01",
    dc_number: "DC-2024-003",
    dc_date: "2024-03-05",
    assigned_date: "2024-03-10",
    replacement_due_period: "3 Years",
    replacement_due_date: "2025-03-10", // Expiring Soon
    operational_status: "Expiring Soon",
    disposition_status: "Assigned"
  },
  {
    id: 4,
    asset_id: "ENG-DSK-004",
    serial_number: "SN888999000",
    hardware_type: "Desktop",
    model_number: "Dell OptiPlex 7090",
    owner_fullname: "",
    p_number: "",
    cadre: "",
    department: "Information Systems",
    section: "IT Support",
    building: "Main Office",
    vendor: "Dell Technologies",
    po_number: "PO-2024-004",
    po_date: "2024-04-01",
    dc_number: "DC-2024-004",
    dc_date: "2024-04-05",
    assigned_date: "",
    replacement_due_period: "4 Years",
    replacement_due_date: "2025-04-05", // Expiring Soon
    operational_status: "New",
    disposition_status: "Is Custody"
  },
  {
    id: 5,
    asset_id: "ENG-LAP-005",
    serial_number: "SN111222333",
    hardware_type: "Laptop",
    model_number: "Lenovo ThinkPad X1",
    owner_fullname: "",
    p_number: "",
    cadre: "",
    department: "Information Systems",
    section: "IT Support",
    building: "Corporate Tower",
    vendor: "Lenovo",
    po_number: "PO-2024-005",
    po_date: "2024-05-01",
    dc_number: "DC-2024-005",
    dc_date: "2024-05-05",
    assigned_date: "",
    replacement_due_period: "3 Years",
    replacement_due_date: "2027-05-05",
    operational_status: "Used",
    disposition_status: "Is Custody"
  },
  {
    id: 6,
    asset_id: "ENG-SRV-006",
    serial_number: "SN444555666",
    hardware_type: "Server",
    model_number: "Dell PowerEdge R750",
    owner_fullname: "",
    p_number: "",
    cadre: "",
    department: "Information Systems",
    section: "Infrastructure",
    building: "Data Center",
    vendor: "Dell Technologies",
    po_number: "PO-2024-006",
    po_date: "2024-06-01",
    dc_number: "DC-2024-006",
    dc_date: "2024-06-05",
    assigned_date: "",
    replacement_due_period: "5 Years",
    replacement_due_date: "2029-06-05",
    operational_status: "Dead",
    disposition_status: "Surplus"
  }
];

function Dashboard() {
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || 'user';
  });

  // Calculate metrics from dummy data
  const metrics = useMemo(() => {
    const totalAssets = DUMMY_ASSETS.length;
    const activeAssets = DUMMY_ASSETS.filter(asset => 
      asset.operational_status?.toLowerCase() === 'active'
    ).length;

    const laptopsNearingShelfLife = DUMMY_ASSETS.filter(asset => 
      asset.operational_status?.toLowerCase() === 'expiring soon' &&
      asset.hardware_type?.toLowerCase().includes('laptop')
    ).length;

    const desktopsNearingShelfLife = DUMMY_ASSETS.filter(asset => 
      asset.operational_status?.toLowerCase() === 'expiring soon' &&
      asset.hardware_type?.toLowerCase().includes('desktop')
    ).length;

    const surplus = DUMMY_ASSETS.filter(asset => 
      asset.disposition_status?.toLowerCase() === 'surplus'
    ).length;

    // Department distribution
    const departmentCounts = {};
    DUMMY_ASSETS.forEach(asset => {
      const dept = asset.department || 'Unknown';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
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
    const spareAssets = DUMMY_ASSETS.filter(asset => 
      asset.disposition_status?.toLowerCase() === 'is custody'
    );

    const laptopSpares = spareAssets.filter(asset => 
      asset.hardware_type?.toLowerCase().includes('laptop')
    );
    
    const desktopSpares = spareAssets.filter(asset => 
      asset.hardware_type?.toLowerCase().includes('desktop')
    );

    // Group spare inventory by operational status
    const groupSparesByStatus = (spareList) => {
      const grouped = { total: spareList.length, new: 0, used: 0, dead: 0 };
      spareList.forEach(asset => {
        const status = asset.operational_status?.toLowerCase();
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

    // Operational status breakdown
    const operationalStatus = {};
    DUMMY_ASSETS.forEach(asset => {
      const status = asset.operational_status || 'Unknown';
      operationalStatus[status] = (operationalStatus[status] || 0) + 1;
    });

    // Disposition status breakdown
    const dispositionStatus = {};
    DUMMY_ASSETS.forEach(asset => {
      const status = asset.disposition_status || 'Unknown';
      dispositionStatus[status] = (dispositionStatus[status] || 0) + 1;
    });

    const otherAssets = {
      operationalStatus,
      dispositionStatus
    };

    return {
      totalAssets,
      activeAssets,
      laptopsNearingShelfLife,
      desktopsNearingShelfLife,
      surplus,
      departmentDistribution,
      spareInventory,
      otherAssets
    };
  }, []);

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
        {/* Main Metrics Cards - 5 cards including Surplus */}
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

        {/* Charts Section - Department Distribution and IS Spare Inventory */}
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

        {/* All Assets Status Overview - No Tabs */}
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

      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;