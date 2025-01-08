import React from 'react';
import Sidebar from '../common/sidebar';
import MobileHeader from '../common/header/MobileHeader';

const AdminLayout = ({children}) => {
    return (
        <div>
            <div className='flex'>
                <Sidebar />
                <div className='w-full'>
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