import React,{ useState,useEffect } from 'react';
import { Link } from 'react-router-dom';
import SideBarHeader from './components/SideBarHeader';
import { ScrollArea } from './components/ScrollArea';
import ExpandSideBar from './components/ExpandSideBar';
import './sidebar-style.css';
import { FaHome,FaList,FaUsers,FaUser,FaChartLine,FaFileAlt } from 'react-icons/fa';
import { MdFolder,MdAssignment,MdLibraryBooks } from 'react-icons/md';

const Sidebar = () => {
  //state to toggle sidebar
  const [isExpanded, setIsExpanded] = useState(true);
  const toggleExpand = () => setIsExpanded(!isExpanded);


  //function to add class to clicked nav item
  const addClass = (nav,e) => {
    if(e.target.classList.contains('nav-item')){
      const navItems = nav.querySelectorAll('.nav-item');
      navItems.forEach(item => item.classList.remove('nav-active'));
      e.target.classList.add('nav-active');
    }
  }

  useEffect(() => {
    const nav = document.querySelector('.nav');

    nav.addEventListener('click', (e) => addClass(nav, e));

    return () => {
      nav.removeEventListener('click', (e) => addClass(nav, e));
    }
  }, [])

    const navItems = [
        {icon : <FaHome className='size-5'/> , label : 'Home', link : '/'},
        {icon : <FaList className='size-5'/>, label : 'Task', link : '/task'},
        {icon : <FaFileAlt className='size-5'/>, label : 'Report', link : '/report'},
        {icon : <MdFolder className='size-5'/>, label : 'Files', link : '/'},
        {icon : <FaChartLine className='size-5'/>, label : 'Monitoring', link : '/monitoring'},
        {icon : <MdAssignment className='size-5'/>, label : 'Audits', link : '/'},
        {icon : <FaUsers className='size-5'/>, label : 'Manage Users', link : '/'},
        {icon : <MdLibraryBooks className='size-5'/>, label : 'Records', link : '/record'},
        {icon : <FaUser className='size-5'/>, label : 'Profile', link : '/'},

    ]
  return (
    <div className = "max-w-56 bg-sidebar-gradient border-r-slate-200 shadow-dark h-screen sidebar">
      <div className='container my-0 mx-auto flex flex-col gap-10 h-full'>
        <SideBarHeader isExpanded={isExpanded}/>
        <ScrollArea>
          <nav className='nav'>
              {
                navItems.map(({icon,label,link}) => <Link key={label} to={link} className='flex items-center gap-4 text-white text-xs font-medium py-2 px-4 hover:bg-white hover:text-primary hover:shadow-light hover:rounded-lg rounded-lg mx-1 nav-item' >    
                  {icon}
                  {isExpanded ? `${label}` : null}
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
