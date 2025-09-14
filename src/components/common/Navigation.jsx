import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Package,
  Plus,
  Tag,
  History,
  UserPlus,
  LogOut,
  Menu,
  X,
  Building2,
  FileText,
  Settings,
  User,
  ChevronDown,
  Users
} from 'lucide-react';
import { useGetCurrentUser } from "../../../api/client/user";

const ICONS = {
  home: Home,
  package: Package,
  plus: Plus,
  tag: Tag,
  history: History,
  userPlus: UserPlus,
  users: Users,
  logOut: LogOut,
  building2: Building2,
  fileText: FileText,
  settings: Settings,
  user: User,
  menu: Menu,
  x: X,
  chevronDown: ChevronDown,
};

// Custom hook for click outside detection
const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
};

// Memoized NavItem component
const NavItem = React.memo(({ item, isActive, isMobile, onMobileClick }) => {
  const IconComponent = ICONS[item.icon];
  
  const baseClasses = useMemo(() => {
    if (isMobile) {
      return `group flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all duration-300 focus:outline-none border-r-4 active:scale-95 ${
        isActive
          ? 'text-white bg-white/15 border-amber-400 shadow-sm'
          : 'text-blue-100/90 hover:text-white hover:bg-white/10 border-transparent'
      }`;
    }
    
    return `group relative px-3 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-all duration-300 focus:outline-none min-w-0 active:scale-95 ${
      isActive
        ? 'bg-white/15 text-white shadow-lg'
        : 'text-blue-100/90 hover:text-white hover:bg-white/10'
    }`;
  }, [isActive, isMobile]);

  if (isMobile) {
    return (
      <Link
        to={item.path}
        onClick={onMobileClick}
        className={baseClasses}
        aria-current={isActive ? 'page' : undefined}
      >
        <IconComponent size={20} className="flex-shrink-0" />
        <span className="flex-shrink-0">{item.label}</span>
      </Link>
    );
  }

  return (
    <Link
      to={item.path}
      className={baseClasses}
      aria-current={isActive ? 'page' : undefined}
      style={{ minWidth: 'fit-content' }}
    >
      <IconComponent size={18} className="flex-shrink-0" />
      <span className="whitespace-nowrap flex-shrink-0 hidden md:inline">{item.label}</span>
      
      {/* Active indicator */}
      <div className="absolute bottom-0 left-1/2 w-1 h-1 rounded-full transform -translate-x-1/2 transition-opacity duration-200">
        <div className={`w-full h-full bg-amber-400 rounded-full ${isActive ? 'opacity-100' : 'opacity-0'}`} />
      </div>
    </Link>
  );
});

NavItem.displayName = 'NavItem';

// Dropdown component
const Dropdown = React.memo(({ trigger, children, isOpen, onToggle, align = 'right' }) => {
  const dropdownRef = useRef(null);
  
  useClickOutside(dropdownRef, () => {
    if (isOpen) onToggle();
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="group flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-blue-100/90 hover:text-white hover:bg-white/10 transition-all duration-300 focus:outline-none active:scale-95"
        aria-expanded={isOpen}
      >
        {trigger}
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown menu */}
      <div className={`absolute top-full mt-2 ${align === 'left' ? 'left-0' : 'right-0'} w-48 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl transition-all duration-300 transform origin-top ${
        isOpen 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
      }`}>
        <div className="py-2">
          {children}
        </div>
      </div>
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

// Dropdown item component
const DropdownItem = React.memo(({ onClick, icon: IconComponent, label, variant = 'default' }) => {
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center space-x-3 px-4 py-3 text-sm transition-all duration-300 focus:outline-none active:scale-95 ${
        variant === 'danger'
          ? 'text-red-200 hover:text-white hover:bg-red-600/25'
          : 'text-blue-100/90 hover:text-white hover:bg-white/10'
      }`}
    >
      <IconComponent size={16} className="flex-shrink-0" />
      <span>{label}</span>
    </button>
  );
});

DropdownItem.displayName = 'DropdownItem';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: user } = useGetCurrentUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Memoize navigation items
  const navItems = useMemo(() => [
    { path: '/', icon: 'home', label: 'Dashboard', id: 'dashboard' },
    { path: '/inventory', icon: 'package', label: 'Inventory', id: 'inventory' },
    { path: '/add-asset', icon: 'plus', label: 'Add Asset', id: 'add-asset' },
    { path: '/categories', icon: 'tag', label: 'Categories', id: 'categories' },
    { path: '/asset-history', icon: 'history', label: 'History', id: 'asset-history' },
  ], []);

  // Memoized callbacks
  const currentPath = useMemo(() => location.pathname, [location.pathname]);
  const isActive = useCallback((path) => currentPath === path, [currentPath]);
  const isAdmin = useMemo(() => user?.role === "admin", [user?.role]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/login");
    setIsUserDropdownOpen(false);
  }, [navigate]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleUserManagementNavigation = useCallback(() => {
    navigate("/manage-users");
    setIsUserDropdownOpen(false);
  }, [navigate]);

  const toggleUserDropdown = useCallback(() => {
    setIsUserDropdownOpen(prev => !prev);
  }, []);

  const handleMobileLogout = useCallback(() => {
    handleLogout();
    closeMobileMenu();
  }, [handleLogout, closeMobileMenu]);

  const handleMobileUserManagement = useCallback(() => {
    navigate("/manage-users");
    closeMobileMenu();
  }, [navigate, closeMobileMenu]);

  return (
    <>
      {/* Main Navigation */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="relative group">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <div className="w-5 h-5 bg-white/90 rounded-sm flex items-center justify-center">
                    <div className="w-2 h-2 bg-gradient-to-br from-amber-400 to-red-500 rounded-sm"></div>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white tracking-tight">ehive</h1>
                <p className="text-xs text-blue-200/60 font-medium -mt-1">WORKSPACE</p>
              </div>
            </div>

            {/* Desktop Navigation - Now shows on medium screens and up */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={isActive(item.path)}
                  isMobile={false}
                />
              ))}
            </div>

            {/* Desktop User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-medium text-white truncate max-w-32">{user.name || 'User'}</p>
                    <p className="text-xs text-blue-200/60 capitalize">{user.role}</p>
                  </div>
                  
                  <Dropdown
                    trigger={
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                          <User size={16} className="text-white" />
                        </div>
                      </div>
                    }
                    isOpen={isUserDropdownOpen}
                    onToggle={toggleUserDropdown}
                  >
                    {isAdmin && (
                      <DropdownItem
                        onClick={handleUserManagementNavigation}
                        icon={Users}
                        label="Manage Users"
                      />
                    )}
                    <DropdownItem
                      onClick={handleLogout}
                      icon={LogOut}
                      label="Logout"
                      variant="danger"
                    />
                  </Dropdown>
                </div>
              )}
            </div>

            {/* Mobile Menu Button - Shows on small and medium screens */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2.5 rounded-lg bg-white/5 text-blue-100 hover:text-white hover:bg-white/10 transition-all duration-300 focus:outline-none active:scale-95"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X size={22} className="flex-shrink-0" />
                ) : (
                  <Menu size={22} className="flex-shrink-0" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-500 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-screen opacity-100 translate-y-0' 
            : 'max-h-0 opacity-0 -translate-y-2'
        } overflow-hidden`}>
          <div className="bg-slate-900/98 backdrop-blur-xl border-t border-white/5">
            {/* Mobile Navigation Links */}
            <div className="py-3 px-2 space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={isActive(item.path)}
                  isMobile={true}
                  onMobileClick={closeMobileMenu}
                />
              ))}
            </div>

            {/* Mobile User Section */}
            {user && (
              <div className="border-t border-white/5 py-4 px-4">
                <div className="mb-4">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                      <User size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.name || 'User'}</p>
                      <p className="text-xs text-blue-200/60 capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  {isAdmin && (
                    <button
                      onClick={handleMobileUserManagement}
                      className="group w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-blue-100/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 focus:outline-none active:scale-95"
                    >
                      <Users size={20} className="flex-shrink-0" />
                      <span>Manage Users</span>
                    </button>
                  )}
                  <button
                    onClick={handleMobileLogout}
                    className="group w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-200 hover:text-white hover:bg-red-600/25 rounded-lg transition-all duration-300 focus:outline-none active:scale-95"
                  >
                    <LogOut size={20} className="flex-shrink-0" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden transition-all duration-300"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export default Navigation;