import { useForm } from "react-hook-form";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import { useSignUp, useGetAllUsers, useChangeUserPassword, useToggleUserStatus } from "../../../api/client/user";
import { Search, Filter, ArrowLeft } from "lucide-react";

export default function ManageUsers({ onBack }) {
  const { register, handleSubmit, reset, watch } = useForm();
  const navigate = useNavigate(); // Add this hook
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // For block/unblock confirmation
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [createUserError, setCreateUserError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const watchPassword = watch("password", "");
  const watchConfirmPassword = watch("confirmPassword", "");
  
  const signUpMutation = useSignUp();
  const { data: usersData, isLoading } = useGetAllUsers();
  const changePasswordMutation = useChangeUserPassword();
  const toggleStatusMutation = useToggleUserStatus();

  // Handle back navigation - use the prop if provided, otherwise use navigate
  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/"); // Navigate to dashboard
    }
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  // Filter users based on search term, role filter, and status filter
  const filteredUsers = useMemo(() => {
    if (!usersData?.users) return [];
    
    return usersData.users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const userStatus = user.status || 'active';
      const matchesStatus = statusFilter === "all" || userStatus === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [usersData?.users, searchTerm, roleFilter, statusFilter]);

  const onSubmit = (data) => {
    setCreateUserError("");

    // Validate password if provided
    if (data.password && !validatePassword(data.password)) {
      setCreateUserError("Password must be at least 6 characters long with 1 uppercase, 1 lowercase, 1 number, and 1 special character");
      return;
    }

    // Check if passwords match
    if (data.password !== data.confirmPassword) {
      setCreateUserError("Passwords do not match");
      return;
    }

    // Remove confirmPassword from the data before sending to API
    const { confirmPassword, ...submitData } = data;

    signUpMutation.mutate(submitData, {
      onSuccess: () => {
        reset();
        setCreateUserError("");
        // Refresh users list
        window.location.reload();
      },
      onError: (error) => {
        setCreateUserError(error.message || "Failed to create user");
      }
    });
  };

  const handleChangePassword = (userId) => {
    setPasswordError("");

    if (!newPassword) {
      setPasswordError("Password is required");
      return;
    }

    if (!validatePassword(newPassword)) {
      setPasswordError("Password must be at least 6 characters long with 1 uppercase, 1 lowercase, 1 number, and 1 special character");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    changePasswordMutation.mutate({
      userId: userId,
      newPassword: newPassword
    }, {
      onSuccess: () => {
        setSelectedUser(null);
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
      }
    });
  };

  const handleToggleUserStatus = () => {
    if (!confirmAction) return;
    
    toggleStatusMutation.mutate({ userId: confirmAction.userId }, {
      onSuccess: () => {
        setConfirmAction(null);
      },
      onError: () => {
        setConfirmAction(null);
      }
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button - Removed heading */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={handleBackClick} // Use the new handler
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
        </div>
        
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Side - Sign Up Form (Compact) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-4 h-fit">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Create New User</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  {...register("name", { required: true })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  {...register("email", { required: true })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  {...register("password", { required: true })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  {...register("confirmPassword", { required: true })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
                {watchPassword && watchConfirmPassword && watchPassword !== watchConfirmPassword && (
                  <div className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-md p-2 mt-1">
                    Passwords do not match.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select 
                  {...register("role", { required: true })} 
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              {createUserError && (
                <div className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-md p-2">
                  {createUserError}
                </div>
              )}

              <button
                type="submit"
                disabled={signUpMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-3 rounded-md text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {signUpMutation.isPending ? "Creating..." : "Create User"}
              </button>
            </form>
          </div>

          {/* Right Side - Users List (Compact Height) */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl p-4 h-[500px] flex flex-col">
            <div className="flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Users Management</h2>
              
              {/* Search and Filter Section */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="pl-8 pr-6 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 appearance-none bg-white min-w-[100px]"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 appearance-none bg-white min-w-[100px]"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Users List - Scrollable */}
            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {filteredUsers.length === 0 ? (
                <div className="text-center text-gray-500 py-6 text-sm">
                  {searchTerm || roleFilter !== "all" || statusFilter !== "all" ? "No users found matching your criteria" : "No users found"}
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition duration-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">{user.name}</h3>
                        <p className="text-xs text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            user.role === 'admin' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            user.status === 'blocked' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.status || 'active'}
                          </span>
                          {user.created_at && (
                            <span className="text-xs text-gray-500">
                              Joined: {formatDate(user.created_at)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium transition duration-200"
                        >
                          Change Password
                        </button>
                        
                        <button
                          onClick={() => setConfirmAction({
                            userId: user.id,
                            userName: user.name,
                            action: user.status === 'blocked' ? 'unblock' : 'block',
                            currentStatus: user.status || 'active'
                          })}
                          disabled={toggleStatusMutation.isPending}
                          className={`px-2 py-1 rounded-md text-xs font-medium transition duration-200 ${
                            user.status === 'blocked'
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                        >
                          {toggleStatusMutation.isPending ? '...' : (user.status === 'blocked' ? 'Unblock' : 'Block')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Block/Unblock Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-80 max-w-sm mx-4 border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Confirm Action
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to <strong>{confirmAction.action}</strong> user "{confirmAction.userName}"?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleToggleUserStatus}
                disabled={toggleStatusMutation.isPending}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition duration-200 disabled:opacity-50 ${
                  confirmAction.action === 'block'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {toggleStatusMutation.isPending ? "Processing..." : `Yes, ${confirmAction.action}`}
              </button>
              
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md text-sm font-medium transition duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal - Blurred Background */}
      {selectedUser && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-sm border border-white/50 shadow-2xl rounded-xl p-6 w-80 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Change Password for {selectedUser.name}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white/80"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white/80"
                />
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <div className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-md p-2 mt-1">
                    Passwords do not match.
                  </div>
                )}
              </div>

              {passwordError && (
                <div className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-md p-2">
                  {passwordError}
                </div>
              )}
              
              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => handleChangePassword(selectedUser.id)}
                  disabled={changePasswordMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition duration-200 disabled:opacity-50"
                >
                  {changePasswordMutation.isPending ? "Changing..." : "Change"}
                </button>
                
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-md text-sm font-medium transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}