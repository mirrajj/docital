// Desc: Admin Layout for the admin dashboard
import Sidebar from '../common/sidebar';
import MobileHeader from '../common/header/MobileHeader';
import { useAuth } from '@/pages/auth/authContext/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminLayout = ({children, page}) => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };
    
    return (
        <div>
            {/* Backdrop for the modal */}
            <div id="backdrop" className={`hidden fixed inset-0 bg-black bg-opacity-50 z-30 backdrop`}></div>
            <div className='flex'>
                <Sidebar />
                
                <div className='w-full lg:overflow-y-scroll lg:h-screen'>
                    <div className='flex justify-between items-center px-4 py-2'>
                        <MobileHeader page={page}/>
                        
                        {/* User info and logout button */}
                        <div className='hidden md:flex items-center space-x-4'>
                            <div className='text-sm'>
                                <p className='font-medium'>{currentUser?.email || 'User'}</p>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className='px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700'
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                    
                    <div className='container my-0 mx-auto'>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;