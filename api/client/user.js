import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../axios";
import API_ROUTE from "../endpoint";
import { toast } from "react-toastify";

// Your existing hooks remain the same...
export function useSignUp() {
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post(API_ROUTE.user.signUp, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("User created successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || " SignUp failed");
    },
  });
}

export function useSignIn() {
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post(API_ROUTE.user.signIn, data);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(" Login successful");
      localStorage.setItem("token", data.token);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || " Login failed");
    },
  });
}

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await api.get("/user/getuser");
      return res.data;
    },
  });
};

// NEW HOOKS FOR ADMIN FUNCTIONALITY
export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      const res = await api.get("/user/all");
      return res.data;
    },
  });
};

export function useChangeUserPassword() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.put("/user/change-password", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
      queryClient.invalidateQueries(["allUsers"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Password change failed");
    },
  });
}

// ADD this function to your existing user.js file
export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId }) => {
      const res = await api.patch(`/user/toggle-status/${userId}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["allUsers"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Status toggle failed");
    },
  });
}