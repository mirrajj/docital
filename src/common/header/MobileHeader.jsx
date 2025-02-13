// Desc: MobileHeader component will only show on mobile devices (max-width: 1024px)
import Nav from '../navigation';
import { FaBars, FaBell, FaUserCircle } from 'react-icons/fa';
import './style.css';
import useSelectElements from '../../utils/useSelectElements';
import findElement from '../../utils/findElement';
import toggleHidden from '../../utils/toggle'; //utility function to toggle "hidden" class on an element


const MobileHeader = ({page}) => {

  const { ref, allElements } = useSelectElements();
  const element = findElement(allElements, "nav");
  // console.log(element);

  return (
    <div className=" w-full py-2 px-4 ml-2 border-b border-gray-300 bg-backgroundColor sticky top-0 z-20" ref={ref}>
      <div className='container my-0 mx-auto flex justify-between'>
        <div className=" hover:bg-gray-100 rounded-lg">
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
          <div className="p-2 hover:bg-gray-300 rounded-lg">

            <FaUserCircle className="icon" />
          </div>
        </div>
      </div>
      {/* //display the navigation component  */}
      <Nav />
    </div>
  );
}

export default MobileHeader;
