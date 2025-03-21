// Desc: MobileHeader component will only show on mobile devices (max-width: 1024px)
import { useState, useRef, useEffect } from 'react';
import Nav from '../navigation';
import { FaBars, FaBell, FaUserCircle, FaSignOutAlt, FaUserCog } from 'react-icons/fa';
import './style.css';
import useSelectElements from '../../utils/useSelectElements';
import findElement from '../../utils/findElement';
import toggleHidden from '../../utils/toggle'; //utility function to toggle "hidden" class on an element
import { useAuth } from '@/pages/auth/authContext/AuthContext';
import { useNavigate } from 'react-router-dom';

const MobileHeader = ({page}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const { ref, allElements } = useSelectElements();
  const element = findElement(allElements, "nav");
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // console.log(currentUser.id);

  return (
    <div className="w-full py-2 px-4   border-b border-gray-300 bg-backgroundColor sticky top-0 z-20" ref={ref}>
      <div className='container my-0 mx-auto flex justify-between'>
        <div className="hover:bg-gray-100 rounded-lg">
          <FaBars
            className="icon cursor-pointer lg:hidden"
            onClick={() => toggleHidden(element)}
          />
          <span className="hidden lg:text-2xl lg:text-primary tracking-widest py-1 lg:block lg:font-semibold lg:ml-2">{page}</span>
        </div>
        <div className='flex gap-4'>
          <div className="p-2 hover:bg-gray-300 rounded-lg">
            <FaBell className="icon" />
          </div>
          <div className="relative" ref={userMenuRef}>
            <div 
              className="p-2 hover:bg-gray-300 rounded-lg cursor-pointer"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <FaUserCircle className="icon" />
            </div>
            
            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium">{currentUser?.email || 'User'}</p>
                </div>
                
                <div className="hover:bg-gray-100 cursor-pointer">
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 text-left">
                    <FaUserCog className="mr-2" />
                    Profile
                  </button>
                </div>
                
                <div className="hover:bg-gray-100 cursor-pointer">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 text-left"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* display the navigation component */}
      <Nav />
    </div>
  );
}

export default MobileHeader;