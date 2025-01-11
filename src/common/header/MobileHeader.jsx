// Desc: MobileHeader component will only show on mobile devices (max-width: 1024px)
import Nav from '../navigation';
import { FaBars,FaBell,FaUserCircle } from 'react-icons/fa';
import './style.css';
import useSelectElements from '../../utils/useSelectElements';
import findElement from '../../utils/findElement';
import toggleHidden from '../../utils/toggle'; //utility function to toggle "hidden" class on an element


const MobileHeader = () => {

    const {ref,allElements} = useSelectElements();
    const element = findElement(allElements, "nav");
    // console.log(element);
    
  return (
    <div className = "bg-white w-full py-5 border-b-0.3 mb-9 border-b-primary-color shadow-md lg:hidden" ref={ref}>
      <div className = 'container my-0 mx-auto flex justify-between'>
        <div>
          <FaBars 
            className = "icon cursor-pointer"
            onClick={() => toggleHidden(element)}
          /> 
        </div>
        <div className='flex'>
          <FaBell className = "icon" />
          <FaUserCircle className = "icon" />
        </div>
      </div>
      {/* //display the navigation component  */}
      <Nav />
    </div>
  );
}

export default MobileHeader;
