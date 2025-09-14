import React, { useState } from "react";
import Footer from "../components/common/Footer";
import Navigation from "../components/common/Navigation";
import Header from "../components/common/Header";
import LoadingSpinner from "../components/common/LoadingSpinner";

import {
  Laptop,
  Users,
  Building,
  Settings,
  Handshake,
  Badge,
  PlusCircle,
  Trash2,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Dummy data for categories
const INITIAL_DUMMY_DATA = {
  hardware_type: [
    { id: 1, value: "Desktop Computer" },
    { id: 2, value: "Laptop" },
    { id: 3, value: "Server" },
    { id: 4, value: "Monitor" },
    { id: 5, value: "Printer" },
  ],
  department: [
    { id: 1, value: "IT Department" },
    { id: 2, value: "Human Resources" },
    { id: 3, value: "Finance" },
    { id: 4, value: "Marketing" },
    { id: 5, value: "Operations" },
  ],
  building: [
    { id: 1, value: "Main Building" },
    { id: 2, value: "Annex Building" },
    { id: 3, value: "Warehouse" },
    { id: 4, value: "Data Center" },
  ],
  section: [
    { id: 1, value: "Ground Floor" },
    { id: 2, value: "First Floor" },
    { id: 3, value: "Second Floor" },
    { id: 4, value: "Basement" },
  ],
  model: [
    { id: 1, value: "Dell OptiPlex 7070" },
    { id: 2, value: "HP EliteDesk 800" },
    { id: 3, value: "Lenovo ThinkCentre M720" },
    { id: 4, value: "MacBook Pro 13\"" },
  ],
  vendor: [
    { id: 1, value: "Dell Technologies" },
    { id: 2, value: "HP Inc." },
    { id: 3, value: "Lenovo" },
    { id: 4, value: "Apple" },
    { id: 5, value: "Microsoft" },
  ],
  cadre: [
    { id: 1, value: "Manager" },
    { id: 2, value: "Senior Developer" },
    { id: 3, value: "Junior Developer" },
    { id: 4, value: "System Administrator" },
    { id: 5, value: "Business Analyst" },
  ],
  disposition_status: [
    { id: 1, value: "Active" },
    { id: 2, value: "Disposed" },
    { id: 3, value: "Retired" },
    { id: 4, value: "Under Maintenance" },
  ],
  operational_status: [
    { id: 1, value: "Operational" },
    { id: 2, value: "Non-Operational" },
    { id: 3, value: "Under Repair" },
    { id: 4, value: "Pending Setup" },
  ],
};

// Dummy user data
const DUMMY_USER = {
  id: 1,
  name: "Admin User",
  role: "admin",
  email: "admin@example.com"
};

// Category configuration with consistent styling
const CATEGORY_CONFIGS = {
  hardware_type: { title: "Hardware Types", icon: Laptop, color: "blue", description: "Computer hardware categories" },
  department: { title: "Departments", icon: Users, color: "green", description: "Organizational departments" },
  building: { title: "Buildings", icon: Building, color: "purple", description: "Physical locations" },
  section: { title: "Sections", icon: Building, color: "orange", description: "Building sections" },
  model: { title: "Models", icon: Settings, color: "indigo", description: "Equipment models" },
  vendor: { title: "Vendors", icon: Handshake, color: "red", description: "Equipment suppliers" },
  cadre: { title: "Cadres", icon: Badge, color: "teal", description: "Employee positions" },
  disposition_status: { title: "Disposition Status", icon: CheckCircle, color: "emerald", description: "Asset disposition states" },
  operational_status: { title: "Operational Status", icon: XCircle, color: "amber", description: "Asset operational states" },
};

// Color mapping for Tailwind
const COLOR_VARIANTS = {
  blue: { border: 'border-blue-500', bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconText: 'text-blue-600', text: 'text-blue-700', textBold: 'text-blue-800', button: 'bg-blue-600 hover:bg-blue-700' },
  green: { border: 'border-green-500', bg: 'bg-green-50', iconBg: 'bg-green-100', iconText: 'text-green-600', text: 'text-green-700', textBold: 'text-green-800', button: 'bg-green-600 hover:bg-green-700' },
  purple: { border: 'border-purple-500', bg: 'bg-purple-50', iconBg: 'bg-purple-100', iconText: 'text-purple-600', text: 'text-purple-700', textBold: 'text-purple-800', button: 'bg-purple-600 hover:bg-purple-700' },
  orange: { border: 'border-orange-500', bg: 'bg-orange-50', iconBg: 'bg-orange-100', iconText: 'text-orange-600', text: 'text-orange-700', textBold: 'text-orange-800', button: 'bg-orange-600 hover:bg-orange-700' },
  indigo: { border: 'border-indigo-500', bg: 'bg-indigo-50', iconBg: 'bg-indigo-100', iconText: 'text-indigo-600', text: 'text-indigo-700', textBold: 'text-indigo-800', button: 'bg-indigo-600 hover:bg-indigo-700' },
  red: { border: 'border-red-500', bg: 'bg-red-50', iconBg: 'bg-red-100', iconText: 'text-red-600', text: 'text-red-700', textBold: 'text-red-800', button: 'bg-red-600 hover:bg-red-700' },
  teal: { border: 'border-teal-500', bg: 'bg-teal-50', iconBg: 'bg-teal-100', iconText: 'text-teal-600', text: 'text-teal-700', textBold: 'text-teal-800', button: 'bg-teal-600 hover:bg-teal-700' },
  emerald: { border: 'border-emerald-500', bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', text: 'text-emerald-700', textBold: 'text-emerald-800', button: 'bg-emerald-600 hover:bg-emerald-700' },
  amber: { border: 'border-amber-500', bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconText: 'text-amber-600', text: 'text-amber-700', textBold: 'text-amber-800', button: 'bg-amber-600 hover:bg-amber-700' },
};

function Categories() {
  const [userRole, setUserRole] = useState("admin");
  const [selectedCategory, setSelectedCategory] = useState("hardware_type");
  const [newCategoryValue, setNewCategoryValue] = useState("");
  const [combinedOptions, setCombinedOptions] = useState(INITIAL_DUMMY_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [nextId, setNextId] = useState(100); // For generating new IDs

  // Dummy user data - simulating the API response
  const user = DUMMY_USER;
  const userLoading = false;
  const isError = false;

  const getCurrentConfig = () => CATEGORY_CONFIGS[selectedCategory];
  const getCurrentItems = () => combinedOptions[selectedCategory] ?? [];
  const getCurrentColorVariant = () => COLOR_VARIANTS[getCurrentConfig().color];

  const handleAddCategory = () => {
    const trimmedValue = newCategoryValue.trim();
    if (!trimmedValue) return;
    const exists = getCurrentItems().some(item => item.value.toLowerCase() === trimmedValue.toLowerCase());
    if (exists) return alert("This category already exists!");
    
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newItem = {
        id: nextId,
        value: trimmedValue
      };
      
      setCombinedOptions(prev => ({
        ...prev,
        [selectedCategory]: [...prev[selectedCategory], newItem]
      }));
      
      setNextId(prev => prev + 1);
      setNewCategoryValue("");
      setIsLoading(false);
    }, 500);
  };

  const handleDeleteCategory = (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setIsLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        setCombinedOptions(prev => ({
          ...prev,
          [selectedCategory]: prev[selectedCategory].filter(item => item.id !== id)
        }));
        setIsLoading(false);
      }, 300);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddCategory();
    }
  };

  // 🔥 FIX 2: Show loading if either categories or user is loading
  if (isLoading && getCurrentItems().length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading categories..." />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading categories!
        </div>
      </div>
    );
  }

  // 🔥 FIX 3: Early return if user is not loaded yet
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading user data..." />
      </div>
    );
  }

  const currentConfig = getCurrentConfig();
  const currentItems = getCurrentItems();
  const colorVariant = getCurrentColorVariant();
  const CurrentIcon = currentConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Category Management"
        subtitle="Manage all asset categories"
        userRole={userRole}
        setUserRole={setUserRole}
      />
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* Category selection buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Object.entries(CATEGORY_CONFIGS).map(([key, config]) => {
            const IconComponent = config.icon;
            const isSelected = selectedCategory === key;
            const colorVariant = COLOR_VARIANTS[config.color];
            return (
              <button
                key={key}
                className={`flex flex-col items-center justify-center space-y-2 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md min-h-[100px] ${
                  isSelected 
                    ? `${colorVariant.border} ${colorVariant.bg} shadow-lg` 
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
                onClick={() => setSelectedCategory(key)}
              >
                <div className={`p-2 rounded-md ${colorVariant.iconBg}`}>
                  <IconComponent size={20} className={colorVariant.iconText} />
                </div>
                <span className={`text-xs font-medium text-center leading-tight ${isSelected ? colorVariant.text : "text-gray-700"}`}>
                  {config.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Management section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* 🔥 FIX 4: Safe check for user.role */}
          {user?.role === "admin" && (
            <div className="mb-6 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newCategoryValue}
                onChange={(e) => setNewCategoryValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Add new ${currentConfig.title.toLowerCase().slice(0, -1)}`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleAddCategory}
                disabled={isLoading || !newCategoryValue.trim()}
                className={`${colorVariant.button} text-white px-6 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <PlusCircle size={18} />
                <span>{isLoading ? "Adding..." : "Add"}</span>
              </button>
            </div>
          )}

          {currentItems.length === 0 ? (
            <p className="text-center text-gray-600 py-12">No categories found</p>
          ) : (
            <div className="space-y-3">
              {currentItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-400 font-medium min-w-[2rem]">{index + 1}.</span>
                    <span className="text-gray-800 font-medium">{item.value}</span>
                  </div>
                  {/* 🔥 FIX 5: Safe check for user.role */}
                  {user?.role === "admin" && (
                    <button
                      onClick={() => handleDeleteCategory(item.id)}
                      disabled={isLoading}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete category"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Categories;