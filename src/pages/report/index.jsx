import React, { useState } from 'react';
import ReportList from './components/ReportList';
import IncidentChart from './components/charts/IncidentChart';
import BatchReport from './components/charts/BatchReport';
import Uncompliance from './components/charts/Uncompliance';

const ReportPage = () => {
  const [category, setCategory] = useState("incidents"); // Default category
  
  return (
    <div className='relative p-3'>
      <ReportList onCategorySelect={setCategory} />
      
      <div className="mt-4">
        {/* Active report content */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-700">
            {category === "incidents" ? "Incident Reports" : "Batch Reports"}
          </h1>
          <p className="text-sm text-gray-500">
            {category === "incidents" 
              ? "View incident data and uncompliance reports" 
              : "Review batch processing statistics"}
          </p>
        </div>
        
        {category === "incidents" && (
          <>
            <Uncompliance />
            <IncidentChart />
          </>
        )}
        {category === "batch" && <BatchReport />}
      </div>
    </div>
  );
};

export default ReportPage;