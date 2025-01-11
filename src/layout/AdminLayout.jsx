// Desc: Admin Layout for the admin dashboard
import Sidebar from '../common/sidebar';
import MobileHeader from '../common/header/MobileHeader';


const AdminLayout = ({children}) => {
    
    return (
        <div>
            {/* //Backdrop for the modal */}
            <div id="backdrop" className={`hidden fixed inset-0 bg-black bg-opacity-50 z-10 backdrop`}></div>
            <div className='flex'>
                <Sidebar />
                <div className='w-full lg:overflow-y-scroll lg:h-screen'>
                    <MobileHeader />
                    <div className='container my-0 mx-auto'>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default AdminLayout;