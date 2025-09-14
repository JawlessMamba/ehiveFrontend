import React from "react";
import { useGetCurrentUser } from "../../../api/client/user";

function Header({ title, subtitle }) {
  const { data: user, isLoading, isError } = useGetCurrentUser();

  if (isLoading) {
    return (
      <header className="bg-white shadow-lg border-b border-gray-200 relative" 
        style={{fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center min-h-[5rem] sm:min-h-[6.5rem] py-4">
            <div className="animate-pulse text-gray-500">Loading header...</div>
          </div>
        </div>
      </header>
    );
  }

  if (isError || !user) {
    return (
      <header className="bg-white shadow-lg border-b border-gray-200 relative" 
        style={{fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center min-h-[5rem] sm:min-h-[6.5rem] py-4">
            <div className="text-red-500">Error loading user info</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header 
      className="bg-white shadow-lg border-b border-gray-200 relative" 
      style={{fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between min-h-[5rem] sm:min-h-[6.5rem] py-3 sm:py-4">
          
          {/* Left section - Logo */}
          <div className="flex items-center flex-shrink-0">
            <img 
              src="/logoo2.png" 
              alt="Main Logo" 
              className="h-12 w-auto sm:h-16 lg:h-20 opacity-95 hover:opacity-100 transition-opacity duration-200 drop-shadow-sm" 
            />
          </div>

          {/* Center section - Title and subtitle */}
          <div className="flex flex-col items-center text-center flex-1 mx-4 sm:mx-6 lg:mx-8 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight leading-tight antialiased bg-gradient-to-r from-blue-900 to-purple-800 bg-clip-text text-transparent drop-shadow-sm">
              {title}
            </h1>
            {subtitle && (
              <div className="mt-1 sm:mt-2">
                {/* Desktop subtitle */}
                <p className="hidden sm:block text-sm sm:text-base font-semibold text-gray-600 tracking-wide antialiased opacity-90">
                  Wishing you a productive day ahead, {user.name}!
                </p>
                {/* Mobile subtitle - shorter version */}
                <p className="sm:hidden text-xs font-medium text-gray-600 opacity-80 truncate max-w-48">
                  Welcome, {user.name}!
                </p>
              </div>
            )} 
          </div>

          {/* Right section - Secondary logo */}
          <div className="flex items-center justify-end flex-shrink-0">
            <img 
              src="/logo3.png" 
              alt="Secondary Logo" 
              className="h-10 w-auto sm:h-12 lg:h-14 opacity-90 hover:opacity-100 transition-opacity duration-200 drop-shadow-sm" 
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;