// src/hooks/useAssets.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../axios/index";
import { toast } from "react-toastify";
import API_ROUTE from "../endpoint/index";

/**
 * Hook for creating a new asset
 */
export function useCreateAsset() {
  const queryClient = useQueryClient();

  const {
    mutate: createAsset,
    isSuccess,
    isLoading,
    isError,
    error,
  } = useMutation({
    mutationFn: async (formData) => {
      return await api.post(API_ROUTE.asset.createAsset, formData);
    },

    onSuccess: () => {
      toast.success("Asset created successfully!");
      // ✅ OPTIMIZED: Only invalidate current page queries
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },

    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to create asset!");
    },
  });

  return { createAsset, isSuccess, isLoading, isError, error };
}

/**
 * ✅ OPTIMIZED: Hook for fetching assets with server-side filtering and pagination
 */
export function useGetAllAssets(filters = {}) {
  const {
    page = 1,
    limit = 50, // ✅ Increased default limit for better performance
    search = "",
    department = "",
    hardware_type = "",
    cadre = "",
    building = "",
    section = "",
    operational_status = "",
    disposition_status = "",
    po_date_from = "",
    po_date_to = "",
    assigned_date_from = "",
    assigned_date_to = "",
    dc_date_from = "",
    dc_date_to = "",
    noLimit = false
  } = filters;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [
      "assets", 
      page, 
      limit, 
      search, 
      department,
      hardware_type,
      cadre,
      building,
      section,
      operational_status,
      disposition_status,
      po_date_from,
      po_date_to,
      assigned_date_from,
      assigned_date_to,
      dc_date_from,
      dc_date_to,
      noLimit
    ],
    queryFn: async () => {
      // ✅ Send ALL filters to backend for server-side processing
      const params = {
        page,
        limit,
        search,
        department,
        hardware_type,
        cadre,
        building,
        section,
        operational_status,
        disposition_status,
        po_date_from,
        po_date_to,
        assigned_date_from,
        assigned_date_to,
        dc_date_from,
        dc_date_to,
        noLimit
      };

      // ✅ Remove empty params to avoid sending unnecessary data
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
      );

      console.log('🔍 Fetching assets with filters:', cleanParams);

      const response = await api.get(API_ROUTE.asset.getAllAssets, { params: cleanParams });

      console.log(`✅ Received ${response.data?.data?.length} assets of ${response.data?.total} total`);

      return {
        data: response.data?.data || [],
        total: response.data?.total || 0,
        page: response.data?.page || page,
        limit: response.data?.limit || limit,
        fetched: response.data?.fetched || 0,
      };
    },
    keepPreviousData: true, // ✅ Prevents flash of loading state
    staleTime: 30000, // ✅ Cache for 30 seconds
    retry: 1,
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to fetch assets!");
    },
  });

  return {
    data: data?.data || [],
    total: data?.total || 0,
    page: data?.page || page,
    limit: data?.limit || limit,
    fetched: data?.fetched || 0,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}

/**
 * Hook for deleting an asset
 */
export function useDeleteAsset() {
  const queryClient = useQueryClient();

  const {
    mutate: deleteAsset,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useMutation({
    mutationFn: async (id) => {
      const endpoint = API_ROUTE.asset.deleteAsset.replace(":id", id);
      return await api.delete(endpoint);
    },

    onSuccess: () => {
      toast.success("Asset deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },

    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete asset!");
    },
  });

  return { deleteAsset, isLoading, isError, error, isSuccess };
}

export function useMarkAssetSurplus() {
  const queryClient = useQueryClient();

  const {
    mutate: markSurplus,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useMutation({
    mutationFn: async (id) => {
      const endpoint = API_ROUTE.asset.markSurplus.replace(":id", id);
      return await api.put(endpoint);
    },

    onSuccess: () => {
      toast.success("Asset marked as surplus successfully!");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },

    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to mark asset as surplus!");
    },
  });

  return { markSurplus, isLoading, isError, error, isSuccess };
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();

  const {
    mutate: updateAsset,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useMutation({
    mutationFn: async ({ id, data }) => {
      const endpoint = API_ROUTE.asset.updateAsset.replace(":id", id);
      return await api.put(endpoint, data);
    },

    onSuccess: () => {
      toast.success("Asset updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },

    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update asset!");
    },
  });

  return { updateAsset, isLoading, isError, error, isSuccess };
}

export function useGetAssetDropdownOptions() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["asset-dropdown-options"],
    queryFn: async () => {
      console.log("Fetching asset dropdown options...");
      const response = await api.get(API_ROUTE.asset.getDropdownOptions);
      console.log("Dropdown options received:", response.data?.data);
      return response.data?.data || {};
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
    onError: (err) => {
      console.error("Failed to fetch dropdown options:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch dropdown options!");
    },
  });

  return {
    data: data || {},
    isLoading,
    isError,
    error,
    refetch,
  };
}
/**
 * ✅ FIXED: Hook for exporting filtered assets
 */
export function useExportAssets() {
  const {
    mutate: exportAssets,
    data,
    isLoading,
    isError,
    error,
  } = useMutation({
    mutationFn: async (filters) => {
      console.log('🔄 Exporting with filters:', filters);
      
      // ✅ Clean filters to remove empty values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters || {}).filter(([key, value]) => 
          value !== "" && value !== null && value !== undefined && 
          !['page', 'limit', 'noLimit'].includes(key)
        )
      );
      
      console.log('🔄 Clean filters for export:', cleanFilters);
      
      try {
        const response = await api.get(API_ROUTE.asset.exportAssets, { 
          params: cleanFilters 
        });
        
        console.log('✅ Export response:', response.data);
        return response.data?.data || [];
      } catch (error) {
        console.error('❌ Export API error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log(`✅ Export successful: ${data.length} assets`);
    },
    onError: (err) => {
      console.error('❌ Export failed:', err);
      toast.error(err?.response?.data?.message || "Failed to export assets!");
    },
  });

  return {
    exportAssets,
    data,
    isLoading,
    isError,
    error,
  };
}

// Add this new hook for fetching filter options
export function useGetFilterOptions() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["asset-filter-options"],
    queryFn: async () => {
      console.log("Fetching asset filter options...");
      const response = await api.get(API_ROUTE.asset.getFilterOptions);
      console.log("Filter options received:", response.data?.data);
      return response.data?.data || {};
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes  
    retry: 2,
    onError: (err) => {
      console.error("Failed to fetch filter options:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch filter options!");
    },
  });

  return {
    data: data || {},
    isLoading,
    isError,
    error,
    refetch,
  };
}

/**
 * Hook for manually checking and updating expiring assets
 */
export function useCheckExpiringAssets() {
  const queryClient = useQueryClient();

  const {
    mutate: checkExpiringAssets,
    isLoading,
    isError,
    error,
    data,
  } = useMutation({
    mutationFn: async () => {
      const response = await api.post(API_ROUTE.asset.checkExpiring);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.affectedRows > 0) {
        toast.success(`Updated ${data.affectedRows} assets to 'expiring soon' status`);
      }
      // Invalidate assets to refresh the table
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to check expiring assets!");
    },
  });

  return { 
    checkExpiringAssets, 
    isLoading, 
    isError, 
    error,
    result: data
  };
}