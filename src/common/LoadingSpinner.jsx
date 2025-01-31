import React from 'react';
import CircularProgress, {
    circularProgressClasses,
} from '@mui/material/CircularProgress';

const  LoadingSpinner = () => {

    return (
        <div className='flex justify-center items-center transform translate-y-1/2'>
            <svg width={0} height={0}>
                <defs>
                    <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#38a169" />
                        <stop offset="30%" stopColor="#34a85321" />
                        <stop offset="100%" stopColor="#17612B" />
                    </linearGradient>
                </defs>
            </svg>
            <CircularProgress sx={{ 'svg circle': { stroke: 'url(#my_gradient)' } }} size={100} />
            <p>loading...</p>
        </div>
    );
}
export default LoadingSpinner;