// api/client/asset.js - MOCK VERSION
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// Mock asset data
const MOCK_ASSETS = [
  {
    id: 1,
    name: "MacBook Pro M2",
    serialNumber: "MBP2023001",
    assetTag: "LAPTOP-001",
    category: "Laptop",
    brand: "Apple",
    model: "MacBook Pro 14-inch",
    status: "Active",
    assignedTo: "Demo User",
    assignedEmail: "hello",
    department: "IT",
    location: "Office - Floor 1",
    purchaseDate: "2023-01-15",
    warrantyExpiry: "2026-01-15",
    cost: 2499.99,
    supplier: "Apple Store",
    notes: "Primary development machine",
    condition: "Excellent",
    createdAt: new Date("2023-01-15").toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Dell UltraSharp Monitor",
    serialNumber: "DELL2023002",
    assetTag: "MONITOR-002",
    category: "Monitor",
    brand: "Dell",
    model: "U2723QE",
    status: "Available",
    assignedTo: null,
    assignedEmail: null,
    department: "IT",
    location: "Storage Room A",
    purchaseDate: "2023-02-20",
    warrantyExpiry: "2026-02-20",
    cost: 649.99,
    supplier: "Dell Direct",
    notes: "4K Monitor - Ready for assignment",
    condition: "New",
    createdAt: new Date("2023-02-20").toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: "iPhone 14 Pro",
    serialNumber: "IPH2023003",
    assetTag: "PHONE-003",
    category: "Mobile Device",
    brand: "Apple",
    model: "iPhone 14 Pro",
    status: "Active",
    assignedTo: "John Doe",
    assignedEmail: "john.doe@company.com",
    department: "Sales",
    location: "User Assigned",
    purchaseDate: "2023-03-10",
    warrantyExpiry: "2024-03-10",
    cost: 1099.99,
    supplier: "Apple Store",
    notes: "Company phone for sales team",
    condition: "Good",
    createdAt: new Date("2023-03-10").toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    name: "HP Printer LaserJet",
    serialNumber: "HP2023004",
    assetTag: "PRINTER-004",
    category: "Printer",
    brand: "HP",
    model: "LaserJet Pro M404n",
    status: "Maintenance",
    assignedTo: null,
    assignedEmail: null,
    department: "Office",
    location: "Office - Floor 2",
    purchaseDate: "2023-01-05",
    warrantyExpiry: "2025-01-05",
    cost: 299.99,
    supplier: "Office Depot",
    notes: "Under maintenance - toner replacement needed",
    condition: "Fair",
    createdAt: new Date("2023-01-05").toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    name: "Surface Pro Tablet",
    serialNumber: "SURF2023005",
    assetTag: "TABLET-005",
    category: "Tablet",
    brand: "Microsoft",
    model: "Surface Pro 9",
    status: "Surplus",
    assignedTo: null,
    assignedEmail: null,
    department: "IT",
    location: "Surplus Storage",
    purchaseDate: "2022-11-20",
    warrantyExpiry: "2024-11-20",
    cost: 1299.99,
    supplier: "Microsoft Store",
    notes: "Marked as surplus - outdated model",
    condition: "Good",
    createdAt: new Date("2022-11-20").toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock dropdown options
const MOCK_DROPDOWN_OPTIONS = {
  categories: ["Laptop", "Monitor", "Mobile Device", "Printer", "Tablet", "Desktop", "Server"],
  brands: ["Apple", "Dell", "HP", "Microsoft", "Lenovo", "ASUS", "Samsung"],
  departments: ["IT", "HR", "Sales", "Marketing", "Engineering", "Finance", "Operations"],
  locations: ["Office - Floor 1", "Office - Floor 2", "Storage Room A", "Storage Room B", "User Assigned", "Remote"],
  statuses: ["Active", "Available", "Maintenance", "Surplus", "Disposed"],
  conditions: ["Excellent", "Good", "Fair", "Poor", "New"]
};

// Helper function to simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
const mockAssetApi = {
  createAsset: async (assetData) => {
    await delay(800);
    
    const newAsset = {
      id: Date.now(),
      ...assetData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    MOCK_ASSETS.unshift(newAsset);
    
    return {
      success: true,
      message: "Asset created successfully",
      asset: newAsset
    };
  },

  getAllAssets: async () => {
    await delay(300);
    
    return {
      success: true,
      assets: MOCK_ASSETS,
      total: MOCK_ASSETS.length,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        limit: 50,
        total: MOCK_ASSETS.length
      }
    };
  },

  updateAsset: async ({ id, ...updateData }) => {
    await delay(600);
    
    const assetIndex = MOCK_ASSETS.findIndex(asset => asset.id === parseInt(id));
    if (assetIndex === -1) {
      throw new Error("Asset not found");
    }
    
    MOCK_ASSETS[assetIndex] = {
      ...MOCK_ASSETS[assetIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      message: "Asset updated successfully",
      asset: MOCK_ASSETS[assetIndex]
    };
  },

  deleteAsset: async (id) => {
    await delay(400);
    
    const assetIndex = MOCK_ASSETS.findIndex(asset => asset.id === parseInt(id));
    if (assetIndex === -1) {
      throw new Error("Asset not found");
    }
    
    const deletedAsset = MOCK_ASSETS.splice(assetIndex, 1)[0];
    
    return {
      success: true,
      message: "Asset deleted successfully",
      asset: deletedAsset
    };
  },

  markSurplus: async (id) => {
    await delay(500);
    
    const assetIndex = MOCK_ASSETS.findIndex(asset => asset.id === parseInt(id));
    if (assetIndex === -1) {
      throw new Error("Asset not found");
    }
    
    MOCK_ASSETS[assetIndex] = {
      ...MOCK_ASSETS[assetIndex],
      status: "Surplus",
      assignedTo: null,
      assignedEmail: null,
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      message: "Asset marked as surplus",
      asset: MOCK_ASSETS[assetIndex]
    };
  },

  getDropdownOptions: async () => {
    await delay(200);
    
    return {
      success: true,
      data: MOCK_DROPDOWN_OPTIONS
    };
  },

  getFilterOptions: async () => {
    await delay(200);
    
    return {
      success: true,
      filters: MOCK_DROPDOWN_OPTIONS
    };
  },

  checkExpiring: async () => {
    await delay(300);
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringAssets = MOCK_ASSETS.filter(asset => {
      if (!asset.warrantyExpiry) return false;
      return new Date(asset.warrantyExpiry) <= thirtyDaysFromNow;
    });
    
    return {
      success: true,
      expiring: expiringAssets,
      count: expiringAssets.length
    };
  },

  exportAssets: async () => {
    await delay(1000);
    
    // Simulate CSV export
    const csvData = "data:text/csv;charset=utf-8," + 
      "ID,Name,Serial Number,Category,Status,Assigned To,Department\n" +
      MOCK_ASSETS.map(asset => 
        `${asset.id},${asset.name},${asset.serialNumber},${asset.category},${asset.status},${asset.assignedTo || ''},${asset.department}`
      ).join('\n');
    
    return {
      success: true,
      message: "Export completed",
      downloadUrl: csvData
    };
  }
};

// Export hooks (keeping the same interface)
export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockAssetApi.createAsset,
    onSuccess: () => {
      toast.success("Asset created successfully");
      queryClient.invalidateQueries(["assets"]);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create asset");
    },
  });
};

export const useGetAllAssets = () => {
  return useQuery({
    queryKey: ["assets"],
    queryFn: mockAssetApi.getAllAssets,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockAssetApi.updateAsset,
    onSuccess: () => {
      toast.success("Asset updated successfully");
      queryClient.invalidateQueries(["assets"]);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update asset");
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockAssetApi.deleteAsset,
    onSuccess: () => {
      toast.success("Asset deleted successfully");
      queryClient.invalidateQueries(["assets"]);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete asset");
    },
  });
};

export const useMarkSurplus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockAssetApi.markSurplus,
    onSuccess: () => {
      toast.success("Asset marked as surplus");
      queryClient.invalidateQueries(["assets"]);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to mark as surplus");
    },
  });
};

export const useGetDropdownOptions = () => {
  return useQuery({
    queryKey: ["dropdownOptions"],
    queryFn: mockAssetApi.getDropdownOptions,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useGetFilterOptions = () => {
  return useQuery({
    queryKey: ["filterOptions"],
    queryFn: mockAssetApi.getFilterOptions,
    staleTime: 30 * 60 * 1000,
  });
};

export const useCheckExpiring = () => {
  return useQuery({
    queryKey: ["expiringAssets"],
    queryFn: mockAssetApi.checkExpiring,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useExportAssets = () => {
  return useMutation({
    mutationFn: mockAssetApi.exportAssets,
    onSuccess: (data) => {
      toast.success("Export completed");
      // Trigger download
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = 'assets-export.csv';
      link.click();
    },
    onError: (err) => {
      toast.error(err.message || "Export failed");
    },
  });
};