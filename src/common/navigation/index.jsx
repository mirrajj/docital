import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome,FaList,FaUsers,FaUser,FaChartLine,FaFileAlt,FaTimes } from 'react-icons/fa';
import { MdFolder,MdAssignment,MdLibraryBooks } from 'react-icons/md';
import useSelectElements from '../../utils/useSelectElements';
import findElement from '../../utils/findElement';
import toggleHidden from '../../utils/toggle';

const Nav = () => {
    const {ref,allElements} = useSelectElements();
    const element = findElement(allElements, "nav");
    // console.log(allElements);

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
        <div ref={ref}>
            <nav className='w-full border-r-primaryLighter border-r shadow-light px-4 pb-8 absolute h-screen overflow-y-auto top-0 bg-white z-20 hidden' id='nav' >
                <FaTimes
                    className='text-xl text-primaryLighter cursor-pointer absolute top-4 right-4'
                    onClick={() => toggleHidden(element)}
                />
                <div className='w-full my-8'>
                    <img src="/images/nav_icon.png" alt="navigation icon" className='w-1/2 max-w-fit my-0 mx-auto' />
                </div>
                <ul>
                    {
                        navItems.map(({ icon, label, link }) => <Link key={label} to={link} className='flex w-full gap-4 text-primary text-sm font-medium py-2 px-4 hover:bg-sidebar-hover hover:shadow-light md:flex md:gap-0 rounded-sm nav-item'>
                            <div className='md:flex md:justify-end md:pr-10 md:grow'>{icon}</div>
                            <span className='md:w-1/2  md:flex'>{label}</span>
                        </Link>)
                    }
                </ul>
            </nav>
        </div>
    );
}
export default Nav;