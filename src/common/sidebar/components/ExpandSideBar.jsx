import React from 'react';

const ExpandSideBar = ({toggleExpand,isExpanded}) => {
  return (
    <div 
      className={`bg-white rounded-full mt-12 fixed bottom-4 left-40 size-8 shadow-darker after:size-3   after:border-t-3 after:border-l-3   after:border-primaryDark after:absolute -rotate-45 after:-translate-y-1/2 after:-translate-x-1/2 after:mt-auto after:top-1/2 after:left-1/2  cursor-pointer ${!isExpanded ? 'relative left-3 scale-x-[-1] rotate-45' : 'fixed'}`}
      
      onClick={toggleExpand}
    >
  
    </div>
  );
}

export default ExpandSideBar;