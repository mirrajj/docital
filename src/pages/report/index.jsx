import React, { useEffect,useState } from 'react';
import ReportHeader from './components/ReportHeader';
import ReportList from './components/ReportList';
import useFetchReportData from './hooks/useFetchReportData';
import IncidentChart from './components/charts/IncidentChart';
import TaskChart from './components/charts/TaskChart';
import BatchReport from './components/charts/BatchReport';
import Uncompliance from './components/charts/Uncompliance';


const ReportPage = () => {
    // const { data, loading, error, fetchData } = useFetchReportData();

    const [category, setCategory] = useState("incidents"); // Default category
    const [filters, setFilters] = useState({ dateRange: null, department: null });
    // const [reportData, setReportData] = useState(data || []);


    // useEffect(() => {
    //     const getData = async() => {
    //          await fetchData(category,filters);
    //     }
    //     getData();
        
    // },[filters])

    // useEffect(() => {
    //     setReportData(data);
    // },[data])
    // console.log(category);


  return (
    <div className='relative'>
      <ReportList onCategorySelect={setCategory} />
      <ReportHeader setFilters={setFilters}/>
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
