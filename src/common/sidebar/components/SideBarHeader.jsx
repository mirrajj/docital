import React from 'react';

const SideBarHeader = ({isExpanded}) => {
  return (
    <>
    
      {isExpanded ? 
      <div className='w-full shadow-darker mt-2 rounded-lg'>
        <img src='/images/sidebar_header.png' alt='docital logo' className='w-full'/>
      </div> : 
      <div className='w-full shadow-darker mt-2 rounded-lg'>
        <img src='/images/sidebar_collapse_logo.png' alt='docital logo' className='w-full'/>
      </div>
    }
    </>
  );
}

export default SideBarHeader;
