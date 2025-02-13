import React from 'react';
// import { Bell, Search, Menu, User } from 'lucide-react';
import { FaBell, FaSearch, FaUser,FaBars } from 'react-icons/fa';

const DashboardHeader = ({ title, onMenuClick }) => {
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="backdrop-blur-md bg-white/75 border-b">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-lg">
              <FaBars size={20} />
            </button>
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="search"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-lg bg-gray-50 border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <FaBell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            
            <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
              <FaUser size={20} />
              <span className="hidden sm:inline">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;