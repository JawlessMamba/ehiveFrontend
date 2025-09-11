import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../axios/index";
import { toast } from "react-toastify";
import API_ROUTE from "../endpoint/index";

/**
 * Hook for creating a new asset transfer
 */
export function useCreateAssetTransfer() {
  const queryClient = useQueryClient();

  const {
    mutate: createTransfer,
    isSuccess,
    isLoading,
    isError,
    error,
  } = useMutation({
    mutationFn: async (formData) => {
      // Note: No need to manually add user ID - the backend will extract it from JWT token
      return await api.post(API_ROUTE.assetTransfer.createTransfer, formData);
    },
    onSuccess: () => {
      toast.success("Asset transfer created successfully!");
      queryClient.invalidateQueries({ queryKey: ["assetTransfers"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || "Failed to create transfer!");
    },
  });

  return { createTransfer, isSuccess, isLoading, isError, error };
}

/**
 * Optimized hook for fetching all asset transfers with backend sorting
 */
export function useGetAllAssetTransfers({ 
  page = 1, 
  limit = 50, // Changed from 20 to 50
  search = "",
  sortKey = "transfer_date",
  sortDirection = "desc"
} = {}) {
  
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["assetTransfers", page, limit, search, sortKey, sortDirection],
    queryFn: async () => {
      const params = { 
        page: Number(page), 
        limit: Number(limit),
        sort_key: sortKey,
        sort_direction: sortDirection.toUpperCase()
      };
      
      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await api.get(API_ROUTE.assetTransfer.getAllTransfers, { params });
      
      return {
        data: response.data?.data || [],
        total: response.data?.total || 0,
        page: response.data?.page || page,
        limit: response.data?.limit || limit,
        totalPages: response.data?.totalPages || 1,
      };
    },
    keepPreviousData: true,
    staleTime: 30 * 1000,
    cacheTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (err) => {
      console.error("Asset transfers fetch error:", err);
      toast.error(err?.response?.data?.error || "Failed to fetch transfers!");
    },
  });

  return {
    data: data?.data || [],
    total: data?.total || 0,
    page: data?.page || page,
    limit: data?.limit || limit,
    totalPages: data?.totalPages || 1,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}

/**
 * Hook for fetching transfer history of a specific asset with pagination
 */
export function useGetAssetTransferHistory(assetId, { 
  page = 1, 
  limit = 50, // Changed from 10 to 50
  sortKey = "transfer_date",
  sortDirection = "desc"
} = {}) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["assetTransferHistory", assetId, page, limit, sortKey, sortDirection],
    queryFn: async () => {
      if (!assetId) throw new Error("Asset ID is required");

      const params = {
        page: Number(page),
        limit: Number(limit),
        sort_key: sortKey,
        sort_direction: sortDirection.toUpperCase()
      };

      const response = await api.get(
        API_ROUTE.assetTransfer.getAssetHistory.replace(":id", assetId),
        { params }
      );
      
      return {
        data: response.data?.data || [],
        total: response.data?.total || 0,
        page: response.data?.page || page,
        limit: response.data?.limit || limit,
        totalPages: response.data?.totalPages || 1,
      };
    },
    enabled: !!assetId,
    keepPreviousData: true,
    staleTime: 60 * 1000,
    onError: (err) => {
      toast.error(err?.response?.data?.error || "Failed to fetch transfer history!");
    },
  });

  return { 
    data: data?.data || [], 
    total: data?.total || 0,
    page: data?.page || page,
    limit: data?.limit || limit,
    totalPages: data?.totalPages || 1,
    isLoading, 
    isFetching,
    isError, 
    error, 
    refetch 
  };
}