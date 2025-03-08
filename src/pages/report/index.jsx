import React, { useState } from 'react';
import ReportList from './components/ReportList';
import IncidentChart from './components/charts/IncidentChart';
import BatchReport from './components/charts/BatchReport';
import Uncompliance from './components/charts/Uncompliance';


const ReportPage = () => {

    const [category, setCategory] = useState("incidents"); // Default category
    const [filters, setFilters] = useState({ dateRange: null, department: null });


  return (
    <div className='relative p-3'>
      <ReportList onCategorySelect={setCategory} />
      {/* <ReportHeader setFilters={setFilters}/> */}
      {category === "incidents" && (
        <>
          <IncidentChart />
          <Uncompliance />
        </>
      )}
      {category === "task" && <TaskChart />}
      {category === "batch" && <BatchReport />}
    </div>
  );
}

export default ReportPage;
