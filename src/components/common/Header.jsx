import React from "react";
import { useGetCurrentUser } from "../../../api/client/user";

function Header({ title, subtitle }) {
  const { data: user, isLoading, isError } = useGetCurrentUser();

  if (isLoading) return <p>Loading header...</p>;
  if (isError || !user) return <p>Error loading user info</p>;

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 relative" style={{fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between min-h-[6.5rem] py-4">
          {/* Left section - Logo (previously center logo) */}
          <div className="flex items-center">
            <img 
              src="/logoo2.png" 
              alt="Main Logo" 
              className="h-20 w-auto opacity-95 hover:opacity-100 transition-opacity duration-200 drop-shadow-sm" 
            />
          </div>

          {/* Center section - Title and subtitle */}
          <div className="flex flex-col items-center text-center flex-1 mx-8">
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight leading-tight antialiased bg-gradient-to-r from-blue-900 to-purple-800 bg-clip-text text-transparent drop-shadow-sm">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base font-semibold text-gray-600 tracking-wide antialiased mt-2 opacity-90">
                Wishing you a productive day ahead, {user.name}!
              </p>
            )} 
          </div>

          {/* Right section - Secondary logo */}
          <div className="flex items-center justify-end">
            <img 
              src="/logo3.png" 
              alt="Secondary Logo" 
              className="h-14 w-auto opacity-90 hover:opacity-100 transition-opacity duration-200 drop-shadow-sm" 
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;