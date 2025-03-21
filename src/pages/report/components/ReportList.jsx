import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChevronLeft } from 'lucide-react';

const ReportList = ({ onCategorySelect }) => {
  const categories = [
    { id: 'incidents', label: 'Charts', icon: '✓' },
    { id: 'batch', label: 'Batch', icon: '✓' },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="fixed right-0 top-16 bg-green-500 size-8 justify-center items-center flex text-white shadow-md z-10"
          aria-label="Open reports"
        >
          <ChevronLeft />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <div className="h-full bg-gray-50 py-6">
          <h2 className="text-lg font-semibold text-gray-500 mb-6 px-4">Report Categories</h2>
          
          <div className="space-y-6 px-4">
            {/* Main categories section */}
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Docital BI
              </h3>
              <ul className="space-y-1">
                {categories.map(category => (
                  <li key={category.id}>
                    <button
                      onClick={() => {
                        onCategorySelect(category.id);
                        // This will find and click the sheet's close button
                        const closeButton = document.querySelector('[data-radix-collection-item]');
                        if (closeButton) closeButton.click();
                      }}
                      className="w-full flex items-center px-3 py-2 text-xs text-green-500 tracking-wider font-semibold rounded-md hover:bg-gray-100"
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
      </SheetContent>
    </Sheet>
  );
};

export default ReportList;