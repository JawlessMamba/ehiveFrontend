// api/client/category.js
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../axios/index";
import { toast } from "react-toastify";
import API_ROUTE from "../endpoint/index";

export function useGetCategories(category) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["categories", category],
    queryFn: async () => {
      const url = API_ROUTE.category.getCategories.replace(":category", category);
      const response = await api.get(url);

      // Normalize to array with consistent structure
      let categories = [];
      if (Array.isArray(response.data)) {
        categories = response.data;
      } else if (Array.isArray(response.data?.data)) {
        categories = response.data.data;
      }

      // Ensure each category has required fields
      return categories.map(cat => ({
        id: cat.id,
        value: cat.value || cat.name,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
        ...cat
      }));
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    onError: (error) => {
      console.error(`Failed to fetch ${category} categories:`, error);
      toast.error("Failed to fetch categories!");
    },
  });

  return { categories: data ?? [], isLoading, isError, error, refetch };
}

export function useAddCategory(category, options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (value) => {
      if (!category) throw new Error("Category is required");
      if (!value?.trim()) throw new Error("Category value is required");

      const url = API_ROUTE.category.addCategory.replace(":category", category);
      const response = await api.post(url, { value: value.trim() });
      return response.data;
    },
    onMutate: async (newValue) => {
      await queryClient.cancelQueries({ queryKey: ["categories", category] });
      const previousCategories = queryClient.getQueryData(["categories", category]);

      // Optimistic update can be done here if desired

      if (options.onMutate) {
        return options.onMutate(newValue);
      }

      return { previousCategories };
    },
    onError: (err, newValue, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(["categories", category], context.previousCategories);
      }

      const message = err.response?.data?.error || "Failed to add category";
      toast.error(message);

      if (options.onError) {
        options.onError(err);
      }
    },
    onSuccess: (data, variables) => {
      toast.success("Category added successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories", category] });
      queryClient.invalidateQueries({ queryKey: ["categories"] }); // For overview

      if (options.onSuccess) {
        options.onSuccess(data, variables);
      }
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ category, id }) => {
      const url = API_ROUTE.category.deleteCategory
        .replace(":category", category)
        .replace(":id", id);
      return await api.delete(url);
    },
    onMutate: async ({ category, id }) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      const previousData = queryClient.getQueryData(["categories"]);

      if (previousData) {
        const updated = { ...previousData };
        if (updated[category]) {
          updated[category] = updated[category].filter(cat => cat.id !== id);
        }
        queryClient.setQueryData(["categories"], updated);
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["categories"], context.previousData);
      }
      toast.error("Failed to delete category!");
    },
    onSuccess: () => {
      toast.success("Category deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useAllCategories(categoryTypes) {
  const results = useQueries({
    queries: categoryTypes.map((cat) => ({
      queryKey: ["categories", cat],
      queryFn: async () => {
        const url = API_ROUTE.category.getCategories.replace(":category", cat);
        const response = await api.get(url);
        const rawData = Array.isArray(response.data) 
          ? response.data 
          : Array.isArray(response.data?.data) 
            ? response.data.data 
            : [];
        // Normalize each category list
        const normalized = rawData.map(item => ({
          id: item.id,
          value: item.value || item.name,
          ...item,
        }));
        return { type: cat, data: normalized };
      },
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 1,
      onError: () => {
        toast.error(`Failed to fetch categories for ${cat}`);
      }
    })),
  });

  // Combine all loaded categories into an object:
  // { department: [...], section: [...], hardware_type: [...] ... }
  const combinedOptions = results.reduce((acc, result) => {
    if (result.data && result.data.type) {
      acc[result.data.type] = result.data.data;
    }
    return acc;
  }, {});

  // Also return loading/error states if needed
  const isLoading = results.some(r => r.isLoading);
  const isError = results.some(r => r.isError);

  return { combinedOptions, isLoading, isError, results };
}