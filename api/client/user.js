// api/client/user.js - MOCK VERSION
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// Mock data
const MOCK_USERS = [
  {
    id: 1,
    email: "hello",
    name: "Demo User",
    role: "admin",
    department: "IT",
    status: "active",
    createdAt: new Date().toISOString(),
    avatar: "/default-avatar.png",
    permissions: ["read", "write", "admin"]
  },
  {
    id: 2,
    email: "john.doe@company.com",
    name: "John Doe",
    role: "user",
    department: "Engineering",
    status: "active",
    createdAt: new Date().toISOString(),
    avatar: "/default-avatar.png",
    permissions: ["read"]
  },
  {
    id: 3,
    email: "jane.smith@company.com",
    name: "Jane Smith",
    role: "manager",
    department: "HR",
    status: "inactive",
    createdAt: new Date().toISOString(),
    avatar: "/default-avatar.png",
    permissions: ["read", "write"]
  }
];

// Helper function to simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
const mockUserApi = {
  signUp: async (data) => {
    await delay(1000);
    // Simulate successful signup
    return {
      success: true,
      message: "User created successfully",
      user: {
        id: Date.now(),
        email: data.email,
        name: data.name || "New User",
        role: "user",
        status: "active"
      }
    };
  },

  signIn: async (data) => {
    await delay(1500);
    
    if (data.email === "hello" && data.password === "admin") {
      const token = `mock-jwt-token-${Date.now()}`;
      const user = MOCK_USERS.find(u => u.email === "hello");
      
      return {
        success: true,
        message: "Login successful",
        token,
        user
      };
    } else {
      throw new Error("Invalid credentials");
    }
  },

  getCurrentUser: async () => {
    await delay(300);
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    // Return the demo user
    return {
      success: true,
      user: MOCK_USERS[0] // Demo user
    };
  },

  getAllUsers: async () => {
    await delay(500);
    
    return {
      success: true,
      users: MOCK_USERS
    };
  },

  changePassword: async (data) => {
    await delay(800);
    
    return {
      success: true,
      message: "Password changed successfully"
    };
  },

  toggleUserStatus: async ({ userId }) => {
    await delay(400);
    
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      user.status = user.status === "active" ? "inactive" : "active";
      return {
        success: true,
        message: `User ${user.status === "active" ? "activated" : "deactivated"} successfully`,
        user
      };
    }
    
    throw new Error("User not found");
  }
};

// Export hooks (keeping the same interface as your original)
export function useSignUp() {
  return useMutation({
    mutationFn: mockUserApi.signUp,
    onSuccess: () => {
      toast.success("User created successfully");
    },
    onError: (err) => {
      toast.error(err.message || "SignUp failed");
    },
  });
}

export function useSignIn() {
  return useMutation({
    mutationFn: mockUserApi.signIn,
    onSuccess: (data) => {
      toast.success("Login successful");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    },
    onError: (err) => {
      toast.error(err.message || "Login failed");
    },
  });
}

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: mockUserApi.getCurrentUser,
    retry: false, // Don't retry on failure
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: mockUserApi.getAllUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export function useChangeUserPassword() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockUserApi.changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully");
      queryClient.invalidateQueries(["allUsers"]);
    },
    onError: (err) => {
      toast.error(err.message || "Password change failed");
    },
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mockUserApi.toggleUserStatus,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["allUsers"]);
    },
    onError: (err) => {
      toast.error(err.message || "Status toggle failed");
    },
  });
}