import React,{ useEffect } from 'react';
import Nav from '../navigation';
import { FaBars,FaBell,FaUserCircle } from 'react-icons/fa';
import './style.css';
import useSelectElements from '../../utils/useSelectElements';
import findElement from '../../utils/findElement';
import toggleHidden from '../../utils/toggle';

const MobileHeader = () => {

    const {ref,allElements} = useSelectElements();
    const element = findElement(allElements, "nav");
    console.log(element);
    
  return (
    <div className = "bg-white w-full py-5 border-b-0.3  border-b-primary-color shadow-md lg:hidden" ref={ref}>
      <div className = 'container my-0 mx-auto flex justify-between'>
        <div>
          <FaBars 
            className = "icon"
            onClick={() => toggleHidden(element)}
          /> 
        </div>
        <div className='flex'>
          <FaBell className = "icon" />
          <FaUserCircle className = "icon" />
        </div>
      </div>
      <Nav />
    </div>
  );
}

export default MobileHeader;
