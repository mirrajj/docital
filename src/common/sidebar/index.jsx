import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SideBarHeader from './components/SideBarHeader';
import { ScrollArea } from './components/ScrollArea';
import ExpandSideBar from './components/ExpandSideBar';
import './sidebar-style.css';
import { FaHome, FaList, FaUsers, FaUser, FaChartLine, FaFileAlt } from 'react-icons/fa';
import { MdFolder, MdAssignment, MdLibraryBooks } from 'react-icons/md';

const Sidebar = () => {
  // State to toggle sidebar
  const [isExpanded, setIsExpanded] = useState(true);
  const toggleExpand = () => setIsExpanded(!isExpanded);
  
  // Get current location to determine active route
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: <FaHome className='size-5' />, label: 'Home', link: '/' },
    { icon: <FaList className='size-5' />, label: 'Task', link: '/task' },
    { icon: <FaFileAlt className='size-5' />, label: 'Report', link: '/report' },
    { icon: <MdFolder className='size-5' />, label: 'Files', link: '/files' },
    { icon: <FaChartLine className='size-5' />, label: 'Monitoring', link: '/monitoring' },
    { icon: <MdAssignment className='size-5' />, label: 'Audits', link: '/audit' },
    { icon: <FaUsers className='size-5' />, label: 'Manage Users', link: '/users' },
    { icon: <MdLibraryBooks className='size-5' />, label: 'Records', link: '/record' },
    { icon: <FaUser className='size-5' />, label: 'Profile', link: '/profile' },
  ];

  // Helper function to check if a nav item is active
  const isActive = (path) => {
    // For home route, only exact match
    if (path === '/') {
      return currentPath === '/';
    }
    // For other routes, check if currentPath starts with the nav item path
    return currentPath.startsWith(path);
  };

  return (
    <div className="max-w-56 bg-sidebar-gradient border-r-slate-200 shadow-dark h-screen sidebar">
      <div className='container my-0 mx-auto flex flex-col gap-10 h-full'>
        <SideBarHeader isExpanded={isExpanded} />
        <ScrollArea>
          <nav className='nav'>
            {
              navItems.map(({ icon, label, link }) => (
                <Link
                  key={label}
                  to={link}
                  className={`flex items-center gap-4 text-white text-xs font-medium py-2 px-4 hover:bg-white hover:text-primary hover:shadow-light hover:rounded-lg rounded-lg mx-1 nav-item ${isActive(link) ? 'nav-active' : ''}`}
                >
                  {icon}
                  {isExpanded ? `${label}` : null}
                </Link>
              ))
            }
          </nav>
          <ExpandSideBar toggleExpand={toggleExpand} isExpanded={isExpanded} />
        </ScrollArea>
      </div>
    </div>
  );
};

export default Sidebar;