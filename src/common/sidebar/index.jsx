import React,{ useState } from 'react';
import { Link } from 'react-router-dom';
import SideBarHeader from './components/SideBarHeader';
import { ScrollArea } from './components/ScrollArea';
import ExpandSideBar from './components/ExpandSideBar';
import './sidebar-style.css';
import { FaHome,FaList,FaUsers,FaUser,FaChartLine,FaFileAlt } from 'react-icons/fa';
import { MdFolder,MdAssignment,MdLibraryBooks } from 'react-icons/md';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpand = () => setIsExpanded(!isExpanded);

    const navItems = [
        {icon : <FaHome className='size-5'/> , label : 'Home', link : '/dashboard'},
        {icon : <FaList className='size-5'/>, label : 'Task', link : '/dashboard'},
        {icon : <FaFileAlt className='size-5'/>, label : 'Report', link : '/dashboard'},
        {icon : <MdFolder className='size-5'/>, label : 'Files', link : '/dashboard'},
        {icon : <FaChartLine className='size-5'/>, label : 'Monitoring', link : '/dashboard'},
        {icon : <MdAssignment className='size-5'/>, label : 'Audits', link : '/dashboard'},
        {icon : <FaUsers className='size-5'/>, label : 'Manage Users', link : '/dashboard'},
        {icon : <MdLibraryBooks className='size-5'/>, label : 'Records', link : '/dashboard'},
        {icon : <FaUser className='size-5'/>, label : 'Profile', link : '/dashboard'}
    ]
  return (
    <div className = "max-w-56 bg-sidebar-gradient border-r-slate-200 shadow-dark h-screen sidebar">
      <div className='container my-0 mx-auto flex flex-col gap-12 h-full'>
        <SideBarHeader isExpanded={isExpanded}/>
        <ScrollArea>
          <nav>
              {
                navItems.map(({icon,label,link}) => <Link key={label} to={link} className='flex items-center gap-4 text-white text-sm font-medium py-2 px-4 hover:bg-primaryLight hover:shadow-light rounded-md mx-1 nav-item'>    
                  {icon}
                  {isExpanded ? <span>{label}</span> : null}
                </Link>)
              }
          </nav>
        <ExpandSideBar toggleExpand={toggleExpand} isExpanded={isExpanded} />
        </ScrollArea>
      </div>
    </div>
  )
}

export default Sidebar;
