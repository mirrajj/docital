import React, { useState } from 'react';
import { ChevronDown,ChevronUp } from 'lucide-react';


const ReportList = ({ onCategorySelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const categories = [
    { id: 'incidents', label: 'Charts', icon: '✓' },
    { id: 'batch', label: 'Batch', icon: '✓' },
   
  ];
  
  
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className={`absolute z-10 left-0 top-0 w-1/5 border shadow-md rounded-b-md ${isOpen ? "h-fit" : " h-0"}`}>
      {/* Toggle button that's always visible */}
      <button
        onClick={toggleSidebar}
        className={`absolute ${isOpen ? "top-0 left-5" : "top-0"} bg-green-500 size-8 justify-center items-center flex text-white rounded-b-lg shadow-md z-10`}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </button>
      
      {/* Sidebar container with transition */}
      <div 
        className={`h-full bg-gray-50 mt-4 w-full border-gray-200 transition-all duration-300 ease-in-out ${
          isOpen ? 'h-full' : 'h-0 overflow-hidden'
        }`}
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-500 mb-6">Report Categories</h2>
          
          <div className="space-y-6">
            {/* Main categories section */}
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Docital BI
              </h3>
              <ul className="space-y-1">
                {categories.map(category => (
                  <li key={category.id}>
                    <button
                      onClick={() => onCategorySelect(category.id)}
                      className={`w-full flex items-center px-3 py-2 text-xs text-green-500 tracking-wider font-semibold rounded-md hover:bg-gray-100
                      `}
                    >
                      <span className="mr-3">{category.icon}</span>
                      {category.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Other categories section */}
            <div>
              <h3 className="text-xs font-medium text-gray-500 tracking-wider mb-3">
                More Features coming in later releases
              </h3>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportList;